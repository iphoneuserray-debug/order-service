import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Transaction, transaction => transaction.order, { onDelete: 'CASCADE' })
    @JoinColumn()
    transaction: Transaction;

    @Column({ default: false })
    completed: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
