import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { Product } from './products/product.entity';
import { ProductImage } from './products/product-image.entity';
import { Customer } from './customers/customer.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { DeliveryType, Transaction, TransactionStatus } from './transactions/transaction.entity';
import { PickupLocation } from './pickup-locations/pickup-location.entity';

dotenv.config();

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Product, ProductImage, Customer, Order, OrderItem, Transaction, PickupLocation],
    synchronize: true,
    ssl: { rejectUnauthorized: false },
});

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

    // Truncate in dependency order
    await AppDataSource.query('TRUNCATE TABLE "order_item", "order", "transaction", "customer", "pickup_location", "product_image", "product" RESTART IDENTITY CASCADE');
    console.log('Truncated existing data');

    const productRepo     = AppDataSource.getRepository(Product);
    const imageRepo       = AppDataSource.getRepository(ProductImage);
    const customerRepo    = AppDataSource.getRepository(Customer);
    const transactionRepo = AppDataSource.getRepository(Transaction);
    const orderRepo       = AppDataSource.getRepository(Order);
    const itemRepo        = AppDataSource.getRepository(OrderItem);
    const pickupRepo      = AppDataSource.getRepository(PickupLocation);

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
    const customers = await customerRepo.save([
        customerRepo.create({ name: 'Alice Chen',    email: 'alice.chen@example.com',    phone: '+61 400 111 222', gender: 'Female' }),
        customerRepo.create({ name: 'Bob Nguyen',    email: 'bob.nguyen@example.com',    phone: '+61 400 333 444', gender: 'Male'   }),
        customerRepo.create({ name: 'Carol Smith',   email: 'carol.smith@example.com',   phone: '+61 400 555 666', gender: 'Female' }),
        customerRepo.create({ name: 'David Park',    email: 'david.park@example.com',    phone: '+61 400 777 888', gender: 'Male'   }),
        customerRepo.create({ name: 'Emma Wilson',   email: 'emma.wilson@example.com',   phone: '+61 400 999 000', gender: 'Female', wechatNumber: 'emma_wx' }),
        customerRepo.create({ name: 'Frank Li',      email: 'frank.li@example.com',      phone: '+61 401 111 222', gender: 'Male',   wechatNumber: 'frankli88' }),
        customerRepo.create({ name: 'Grace Kim',     email: 'grace.kim@example.com',     phone: '+61 401 333 444', gender: 'Female', wechatNumber: 'gracekim' }),
        customerRepo.create({ name: 'Henry Zhang',   email: 'henry.zhang@example.com',                             gender: 'Male',   wechatNumber: 'hzhang2024' }),
    ]);
    const [c1, c2, c3, c4, c5, c6, c7, c8] = customers;
    console.log(`Inserted ${customers.length} customers`);

    const [roses, sunflowers, lavender, tulips, lilies, peonies] = products;

    // ── Pickup Locations ──────────────────────────────────────────────────────
    const pickupLocations = await pickupRepo.save([
        pickupRepo.create({ name: 'Melbourne CBD Store',   address: '123 Collins St, Melbourne VIC 3000', active: true }),
        pickupRepo.create({ name: 'Fitzroy Garden Booth',  address: '45 Smith St, Fitzroy VIC 3065',      active: true }),
    ]);
    const [cbd, fitzroy] = pickupLocations;
    console.log(`Inserted ${pickupLocations.length} pickup locations`);

    // ── Transactions + Orders ──────────────────────────────────────────────────
    async function createTx(
        data: Partial<Transaction>,
        items: { product: Product; quantity: number }[],
        completed = false,
    ) {
        const tx = await transactionRepo.save(transactionRepo.create(data));
        await itemRepo.save(items.map((i) =>
            itemRepo.create({ transaction: tx, product: i.product, quantity: i.quantity, priceAud: i.product.priceAud })
        ));
        await orderRepo.save(orderRepo.create({ transaction: tx, completed }));
        return tx;
    }

    const P = TransactionStatus.PAID;
    const N = TransactionStatus.PENDING;
    const F = TransactionStatus.FAILED;
    const DEL = DeliveryType.DELIVERY;
    const PIC = DeliveryType.PICKUP;

    await createTx({ customer: c1, totalAud: roses.priceAud + lavender.priceAud,               paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_001', deliveryType: DEL, deliveryAddress: '12 Rose Ln, Richmond VIC 3121',          note: 'Please include a gift card' },    [{ product: roses, quantity: 1 }, { product: lavender, quantity: 1 }], true);
    await createTx({ customer: c2, totalAud: tulips.priceAud * 2,                              paymentMethod: 'card', status: N,                                        deliveryType: PIC, pickupLocation: cbd },                                                                                 [{ product: tulips, quantity: 2 }]);
    await createTx({ customer: c3, totalAud: lilies.priceAud + sunflowers.priceAud,            paymentMethod: 'card', status: F, stripePaymentIntentId: 'pi_mock_003', deliveryType: DEL, deliveryAddress: '88 Park Ave, Parkville VIC 3052' },                                               [{ product: lilies, quantity: 1 }, { product: sunflowers, quantity: 1 }]);
    await createTx({ customer: c4, totalAud: roses.priceAud + peonies.priceAud,                paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_004', deliveryType: PIC, pickupLocation: fitzroy,                                    note: 'Anniversary — wrap nicely please' }, [{ product: roses, quantity: 1 }, { product: peonies, quantity: 1 }], true);
    await createTx({ customer: c5, totalAud: sunflowers.priceAud + tulips.priceAud,            paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_005', deliveryType: DEL, deliveryAddress: '3 Sunflower Cres, Camberwell VIC 3124',   note: 'Birthday surprise' },               [{ product: sunflowers, quantity: 1 }, { product: tulips, quantity: 1 }], true);
    await createTx({ customer: c6, totalAud: lavender.priceAud * 3,                            paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_006', deliveryType: PIC, pickupLocation: cbd },                                                                                [{ product: lavender, quantity: 3 }]);
    await createTx({ customer: c7, totalAud: peonies.priceAud,                                 paymentMethod: 'card', status: N,                                        deliveryType: DEL, deliveryAddress: '7 Garden Rd, Hawthorn VIC 3122' },                                                  [{ product: peonies, quantity: 1 }]);
    await createTx({ customer: c8, totalAud: roses.priceAud + lilies.priceAud,                 paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_008',                                                                                 note: 'Leave at front door' },             [{ product: roses, quantity: 1 }, { product: lilies, quantity: 1 }], true);
    await createTx({ customer: c1, totalAud: tulips.priceAud + lavender.priceAud,              paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_009', deliveryType: PIC, pickupLocation: fitzroy },                                                                             [{ product: tulips, quantity: 1 }, { product: lavender, quantity: 1 }]);
    await createTx({ customer: c3, totalAud: sunflowers.priceAud * 2 + roses.priceAud,         paymentMethod: 'card', status: F, stripePaymentIntentId: 'pi_mock_010', deliveryType: DEL, deliveryAddress: '55 Bloom St, Carlton VIC 3053' },                                                  [{ product: sunflowers, quantity: 2 }, { product: roses, quantity: 1 }]);
    await createTx({ customer: c5, totalAud: peonies.priceAud + lilies.priceAud,               paymentMethod: 'card', status: P, stripePaymentIntentId: 'pi_mock_011', deliveryType: PIC, pickupLocation: cbd,                                        note: 'Wrap in white ribbon' },            [{ product: peonies, quantity: 1 }, { product: lilies, quantity: 1 }], true);
    await createTx({ customer: c2, totalAud: roses.priceAud * 2,                               paymentMethod: 'card', status: N,                                        deliveryType: DEL, deliveryAddress: '20 Floral Dr, St Kilda VIC 3182' },                                                 [{ product: roses, quantity: 2 }]);

    console.log('Inserted 12 transactions with items and fulfillment orders');
    console.log('Seed complete');
    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
