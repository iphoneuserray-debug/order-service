import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Product } from './products/product.entity';
import { Customer } from './customers/customer.entity';
import { Order, OrderStatus } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';

dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Product, Customer, Order, OrderItem],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
});

async function seed() {
    await AppDataSource.initialize();
    console.log('Connected to database');

    const productRepo = AppDataSource.getRepository(Product);
    const customerRepo = AppDataSource.getRepository(Customer);
    const orderRepo = AppDataSource.getRepository(Order);
    const orderItemRepo = AppDataSource.getRepository(OrderItem);

    // Products
    const p1 = productRepo.create({ name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with 30-hour battery life and active noise cancellation.', priceAud: 299.99, tags: ['electronics', 'audio', 'wireless'], availability: true, imageUrl: null });
    const p2 = productRepo.create({ name: 'Mechanical Keyboard', description: 'Compact 75% layout with Cherry MX Brown switches and RGB backlighting.', priceAud: 189.00, tags: ['electronics', 'peripherals', 'keyboards'], availability: true, imageUrl: null });
    const p3 = productRepo.create({ name: 'Ergonomic Office Chair', description: 'Fully adjustable lumbar support chair suitable for long work sessions.', priceAud: 549.00, tags: ['furniture', 'office', 'ergonomics'], availability: true, imageUrl: null });
    const p4 = productRepo.create({ name: 'USB-C Hub 7-in-1', description: 'Multiport adapter with HDMI 4K, 3x USB-A, SD card reader, and 100W PD.', priceAud: 79.95, tags: ['electronics', 'accessories', 'usb'], availability: true, imageUrl: null });
    const p5 = productRepo.create({ name: 'Laptop Stand Aluminium', description: 'Adjustable aluminium stand compatible with laptops 10–17 inches.', priceAud: 59.99, tags: ['accessories', 'office', 'laptop'], availability: false, imageUrl: null });
    const products = await productRepo.save([p1, p2, p3, p4, p5]);
    console.log(`Inserted ${products.length} products`);

    // Customers
    const c1 = customerRepo.create({ name: 'Alice Chen', email: 'alice.chen@example.com', phone: '+61 400 111 222' });
    const c2 = customerRepo.create({ name: 'Bob Nguyen', email: 'bob.nguyen@example.com', phone: '+61 400 333 444' });
    const c3 = customerRepo.create({ name: 'Carol Smith', email: 'carol.smith@example.com', phone: '+61 400 555 666' });
    const customers = await customerRepo.save([c1, c2, c3]);
    console.log(`Inserted ${customers.length} customers`);

    const [headphones, keyboard, chair, hub] = products;
    const [alice, bob, carol] = customers;

    // Order 1 — Alice: headphones + hub, paid
    const order1 = orderRepo.create({ customer: alice, totalAud: headphones.priceAud + hub.priceAud, paymentMethod: 'card', status: OrderStatus.PAID, stripePaymentIntentId: 'pi_mock_001' });
    await orderRepo.save(order1);
    await orderItemRepo.save([
        orderItemRepo.create({ order: order1, product: headphones, quantity: 1, priceAud: headphones.priceAud }),
        orderItemRepo.create({ order: order1, product: hub, quantity: 1, priceAud: hub.priceAud }),
    ]);

    // Order 2 — Bob: keyboard x2, pending
    const order2 = orderRepo.create({ customer: bob, totalAud: keyboard.priceAud * 2, paymentMethod: 'card', status: OrderStatus.PENDING });
    await orderRepo.save(order2);
    await orderItemRepo.save([
        orderItemRepo.create({ order: order2, product: keyboard, quantity: 2, priceAud: keyboard.priceAud }),
    ]);

    // Order 3 — Carol: chair + hub, failed
    const order3 = orderRepo.create({ customer: carol, totalAud: chair.priceAud + hub.priceAud, paymentMethod: 'card', status: OrderStatus.FAILED, stripePaymentIntentId: 'pi_mock_003' });
    await orderRepo.save(order3);
    await orderItemRepo.save([
        orderItemRepo.create({ order: order3, product: chair, quantity: 1, priceAud: chair.priceAud }),
        orderItemRepo.create({ order: order3, product: hub, quantity: 1, priceAud: hub.priceAud }),
    ]);

    console.log('Inserted 3 orders with items');
    console.log('Seed complete');
    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
