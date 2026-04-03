import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    // Stripe's own ID for this customer — lets you link payments in Stripe dashboard
    @Column({ nullable: true })
    stripeCustomerId: string;

    @OneToMany(() => Order, order => order.customer)
    orders: Order[];
}
