import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';

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

    @OneToMany(() => ProductImage, (image) => image.product)
    images: ProductImage[];
}
