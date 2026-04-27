import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductImagesService } from './product-images.service';

@Controller('products/:productId/images')
export class ProductImagesController {
    constructor(private readonly imagesService: ProductImagesService) {}

    @Get()
    findAll(@Param('productId') productId: string) {
        return this.imagesService.findAll(productId);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    upload(
        @Param('productId') productId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.imagesService.create(productId, file);
    }

    @Delete(':imageId')
    remove(
        @Param('productId') productId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.imagesService.remove(productId, imageId);
    }
}
