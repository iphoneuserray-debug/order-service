import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, customer => customer.orders, { onDelete: 'CASCADE' })
    customer: Customer;

    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items: OrderItem[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAud: number;

    @Column({ default: 'card' })
    paymentMethod: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    // Store Stripe's payment intent ID so you can look up the payment later
    @Column({ nullable: true })
    stripePaymentIntentId: string;

    @Column({ nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;
}
