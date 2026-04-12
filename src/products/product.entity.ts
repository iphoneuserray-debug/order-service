import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    priceAud: number;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({ default: true })
    availability: boolean;

    @Column({ type: 'text', nullable: true })
    imageUrl: string | null;
}
