import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type DiscountType = 'percent' | 'fixed';

@Entity()
export class Coupon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    type: DiscountType;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
    minOrderAud: number | null;

    @Column({ default: true })
    active: boolean;
}
