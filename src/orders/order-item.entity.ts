import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
    product: Product;

    @Column()
    quantity: number;

    // Snapshot the price at time of purchase — product price may change later
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceAud: number;
}
