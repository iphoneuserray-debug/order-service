import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProductImage } from './product-image.entity';
import { ProductsService } from './products.service';

const BUCKET = 'product-images';

@Injectable()
export class ProductImagesService implements OnModuleInit {
    private supabase: SupabaseClient;

    constructor(
        @InjectRepository(ProductImage)
        private readonly imageRepository: Repository<ProductImage>,
        private readonly productsService: ProductsService,
        private readonly configService: ConfigService,
    ) {
        this.supabase = createClient(
            this.configService.getOrThrow<string>('SUPABASE_URL'),
            this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
        );
    }

    async onModuleInit() {
        const { data: buckets } = await this.supabase.storage.listBuckets();
        const exists = buckets?.some((b) => b.name === BUCKET);
        if (!exists) {
            await this.supabase.storage.createBucket(BUCKET, { public: true });
        }
    }

    async findAll(productId: string): Promise<ProductImage[]> {
        await this.productsService.findOne(productId);
        return this.imageRepository.find({
            where: { product: { id: productId } },
            order: { sortOrder: 'ASC' },
        });
    }

    async create(productId: string, file: Express.Multer.File): Promise<ProductImage> {
        const product = await this.productsService.findOne(productId);
        const filename = `${productId}/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;

        const { error } = await this.supabase.storage
            .from(BUCKET)
            .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });

        if (error) throw new Error(`Storage upload failed: ${error.message}`);

        const { data: urlData } = this.supabase.storage.from(BUCKET).getPublicUrl(filename);

        const count = await this.imageRepository.count({ where: { product: { id: productId } } });
        const image = this.imageRepository.create({
            url: urlData.publicUrl,
            sortOrder: count,
            product,
        });
        return this.imageRepository.save(image);
    }

    async remove(productId: string, imageId: string): Promise<void> {
        const image = await this.imageRepository.findOne({
            where: { id: imageId, product: { id: productId } },
        });
        if (!image) throw new NotFoundException(`Image ${imageId} not found`);

        await this.imageRepository.delete(imageId);

        try {
            const url = new URL(image.url);
            const path = url.pathname.split(`/object/public/${BUCKET}/`)[1];
            if (path) await this.supabase.storage.from(BUCKET).remove([path]);
        } catch {
            // ignore storage cleanup failure
        }
    }
}
