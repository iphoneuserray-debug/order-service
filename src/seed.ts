import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { extname } from 'path';
import { Product } from './products/product.entity';
import { ProductImage } from './products/product-image.entity';
import { Customer } from './customers/customer.entity';
import { Order, OrderStatus } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';

dotenv.config();

const BUCKET = 'product-images';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Product, ProductImage, Customer, Order, OrderItem],
    synchronize: true,
    ssl: { rejectUnauthorized: false },
});

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Stable picsum seeds mapped to each product
const PRODUCT_IMAGES: Record<string, string[]> = {
    'Red Rose Bouquet':        ['rose-1', 'rose-2'],
    'Sunflower Arrangement':   ['sunflower-1', 'sunflower-2'],
    'Lavender Bundle':         ['lavender-1', 'lavender-2'],
    'Mixed Tulip Bouquet':     ['tulip-1', 'tulip-2'],
    'White Lily Collection':   ['lily-1', 'lily-2'],
    'Peony Vase':              ['peony-1', 'peony-2'],
};

async function ensureBucket() {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
        await supabase.storage.createBucket(BUCKET, { public: true });
        console.log(`Created bucket: ${BUCKET}`);
    }
}

async function uploadImage(productId: string, seed: string): Promise<string> {
    const url = `https://picsum.photos/seed/${seed}/800/1000`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image ${url}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = `${productId}/${seed}.jpg`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType: 'image/jpeg', upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
}

async function seed() {
    await AppDataSource.initialize();
    console.log('Connected to database');
    await ensureBucket();

    const productRepo   = AppDataSource.getRepository(Product);
    const imageRepo     = AppDataSource.getRepository(ProductImage);
    const customerRepo  = AppDataSource.getRepository(Customer);
    const orderRepo     = AppDataSource.getRepository(Order);
    const itemRepo      = AppDataSource.getRepository(OrderItem);

    // ── Products ──────────────────────────────────────────────────────────────
    const productDefs = [
        { name: 'Red Rose Bouquet',      description: 'A stunning arrangement of 24 long-stem red roses, perfect for romance and special occasions.', priceAud: 89.00,  tags: ['roses', 'romantic', 'wedding'],    availability: true  },
        { name: 'Sunflower Arrangement', description: 'Bright and cheerful sunflowers that bring warmth to any room. Available in bunches of 12.',       priceAud: 55.00,  tags: ['sunflowers', 'cheerful', 'gift'],  availability: true  },
        { name: 'Lavender Bundle',       description: 'Freshly dried lavender bundles with a calming fragrance, ideal for home décor and gifting.',       priceAud: 35.00,  tags: ['lavender', 'fragrant', 'dried'],   availability: true  },
        { name: 'Mixed Tulip Bouquet',   description: 'A vibrant mix of spring tulips in pink, yellow, and purple — hand-tied and ready to gift.',        priceAud: 65.00,  tags: ['tulips', 'spring', 'colorful'],    availability: true  },
        { name: 'White Lily Collection', description: 'Elegant white oriental lilies that fill any space with a delicate fragrance and refined beauty.',   priceAud: 75.00,  tags: ['lilies', 'elegant', 'sympathy'],   availability: true  },
        { name: 'Peony Vase',            description: 'Lush garden peonies arranged in a glass vase — a luxurious centrepiece for any occasion.',         priceAud: 110.00, tags: ['peonies', 'luxury', 'birthday'],   availability: false },
    ];

    const products: Product[] = [];
    for (const def of productDefs) {
        const product = productRepo.create(def);
        const saved = await productRepo.save(product);
        products.push(saved);

        // Upload images and create ProductImage records
        const seeds = PRODUCT_IMAGES[def.name] ?? [];
        for (let i = 0; i < seeds.length; i++) {
            process.stdout.write(`  Uploading image ${i + 1}/${seeds.length} for "${def.name}"…`);
            const publicUrl = await uploadImage(saved.id, seeds[i]);
            const image = imageRepo.create({ url: publicUrl, sortOrder: i, product: saved });
            await imageRepo.save(image);
            console.log(' done');
        }
    }
    console.log(`Inserted ${products.length} products with images`);

    // ── Customers ─────────────────────────────────────────────────────────────
    const [c1, c2, c3, c4] = await customerRepo.save([
        customerRepo.create({ name: 'Alice Chen',    email: 'alice.chen@example.com',    phone: '+61 400 111 222' }),
        customerRepo.create({ name: 'Bob Nguyen',    email: 'bob.nguyen@example.com',    phone: '+61 400 333 444' }),
        customerRepo.create({ name: 'Carol Smith',   email: 'carol.smith@example.com',   phone: '+61 400 555 666' }),
        customerRepo.create({ name: 'David Park',    email: 'david.park@example.com'                              }),
    ]);
    console.log('Inserted 4 customers');

    const [roses, sunflowers, lavender, tulips, lilies, peonies] = products;

    // ── Orders ────────────────────────────────────────────────────────────────
    // Order 1 — Alice: roses + lavender, paid
    const o1 = await orderRepo.save(orderRepo.create({
        customer: c1, totalAud: roses.priceAud + lavender.priceAud,
        paymentMethod: 'card', status: OrderStatus.PAID,
        stripePaymentIntentId: 'pi_mock_001',
        note: 'Please include a gift card',
    }));
    await itemRepo.save([
        itemRepo.create({ order: o1, product: roses,    quantity: 1, priceAud: roses.priceAud }),
        itemRepo.create({ order: o1, product: lavender, quantity: 1, priceAud: lavender.priceAud }),
    ]);

    // Order 2 — Bob: tulips x2, pending
    const o2 = await orderRepo.save(orderRepo.create({
        customer: c2, totalAud: tulips.priceAud * 2,
        paymentMethod: 'card', status: OrderStatus.PENDING,
    }));
    await itemRepo.save([
        itemRepo.create({ order: o2, product: tulips, quantity: 2, priceAud: tulips.priceAud }),
    ]);

    // Order 3 — Carol: lilies + sunflowers, failed
    const o3 = await orderRepo.save(orderRepo.create({
        customer: c3, totalAud: lilies.priceAud + sunflowers.priceAud,
        paymentMethod: 'card', status: OrderStatus.FAILED,
        stripePaymentIntentId: 'pi_mock_003',
    }));
    await itemRepo.save([
        itemRepo.create({ order: o3, product: lilies,      quantity: 1, priceAud: lilies.priceAud }),
        itemRepo.create({ order: o3, product: sunflowers,  quantity: 1, priceAud: sunflowers.priceAud }),
    ]);

    // Order 4 — David: roses + peonies, paid
    const o4 = await orderRepo.save(orderRepo.create({
        customer: c4, totalAud: roses.priceAud + peonies.priceAud,
        paymentMethod: 'card', status: OrderStatus.PAID,
        stripePaymentIntentId: 'pi_mock_004',
        note: 'Anniversary — wrap nicely please',
    }));
    await itemRepo.save([
        itemRepo.create({ order: o4, product: roses,   quantity: 1, priceAud: roses.priceAud }),
        itemRepo.create({ order: o4, product: peonies, quantity: 1, priceAud: peonies.priceAud }),
    ]);

    console.log('Inserted 4 orders with items');
    console.log('Seed complete');
    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
