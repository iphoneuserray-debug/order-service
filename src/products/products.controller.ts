import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService, ProductFilter } from './products.service';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    findAll(): Promise<Product[]> {
        return this.productsService.findAll();
    }

    @Get('filter')
    findByFilter(
        @Query('tags') tags?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('availability') availability?: string,
    ): Promise<Product[]> {
        const filter: ProductFilter = {
            tags: tags ? tags.split(',') : undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            availability: availability !== undefined ? availability === 'true' : undefined,
        };
        return this.productsService.findByFilter(filter);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Product> {
        return this.productsService.findOne(id);
    }

    @Post()
    create(@Body() body: CreateProductDto): Promise<Product> {
        return this.productsService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateProductDto): Promise<Product> {
        return this.productsService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.productsService.remove(id);
    }
}
