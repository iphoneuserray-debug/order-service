import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

export interface ProductFilter {
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    availability?: boolean;
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    findAll(): Promise<Product[]> {
        return this.productRepository.find();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) throw new NotFoundException(`Product ${id} not found`);
        return product;
    }

    async findByFilter(filter: ProductFilter): Promise<Product[]> {
        const qb = this.productRepository.createQueryBuilder('product');

        if (filter.availability !== undefined) {
            qb.andWhere('product.availability = :availability', { availability: filter.availability });
        }
        if (filter.minPrice !== undefined) {
            qb.andWhere('product.priceAud >= :minPrice', { minPrice: filter.minPrice });
        }
        if (filter.maxPrice !== undefined) {
            qb.andWhere('product.priceAud <= :maxPrice', { maxPrice: filter.maxPrice });
        }
        if (filter.tags && filter.tags.length > 0) {
            qb.andWhere('product.tags && :tags', { tags: filter.tags });
        }

        return qb.getMany();
    }

    create(data: Partial<Product>): Promise<Product> {
        const product = this.productRepository.create(data);
        return this.productRepository.save(product);
    }

    async update(id: string, data: Partial<Product>): Promise<Product> {
        await this.findOne(id);
        await this.productRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.productRepository.delete(id);
    }
}
