import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';

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

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    wechatNumber: string;

    // Stripe's own ID for this customer — lets you link payments in Stripe dashboard
    @Column({ nullable: true })
    stripeCustomerId: string;

    @OneToMany(() => Transaction, transaction => transaction.customer)
    transactions: Transaction[];
}
