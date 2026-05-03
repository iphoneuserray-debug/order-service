import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './coupon.dto';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) {}

    @Get('validate')
    validate(@Query('code') code: string, @Query('subtotal') subtotal: string) {
        return this.couponsService.validateAsync(code ?? '', parseFloat(subtotal) || 0);
    }

    @Get()
    findAll() {
        return this.couponsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.couponsService.findOne(id);
    }

    @Post()
    create(@Body() body: CreateCouponDto) {
        return this.couponsService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateCouponDto) {
        return this.couponsService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: string) {
        return this.couponsService.remove(id);
    }
}
