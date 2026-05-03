import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/order.entity';
import { PickupLocation } from '../pickup-locations/pickup-location.entity';

export enum TransactionStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

export enum DeliveryType {
    DELIVERY = 'delivery',
    PICKUP = 'pickup',
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, customer => customer.transactions, { onDelete: 'CASCADE', nullable: true })
    customer: Customer;

    @OneToMany(() => OrderItem, item => item.transaction, { cascade: true })
    items: OrderItem[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAud: number;

    @Column({ default: 'card' })
    paymentMethod: string;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ type: 'enum', enum: DeliveryType, nullable: true })
    deliveryType: DeliveryType;

    @Column({ nullable: true })
    deliveryAddress: string;

    @ManyToOne(() => PickupLocation, { onDelete: 'SET NULL', nullable: true })
    pickupLocation: PickupLocation;

    @Column({ nullable: true })
    stripePaymentIntentId: string;

    @Column({ nullable: true })
    note: string;

    @OneToOne(() => Order, order => order.transaction)
    order: Order;

    @CreateDateColumn()
    createdAt: Date;
}
