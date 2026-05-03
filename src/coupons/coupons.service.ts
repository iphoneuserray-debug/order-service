import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { CreateCouponDto, UpdateCouponDto } from './coupon.dto';

export interface CouponValidation {
    valid: boolean;
    coupon?: Coupon;
    discountAud?: number;
    message?: string;
}

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private readonly repo: Repository<Coupon>,
    ) {}

    findAll(): Promise<Coupon[]> {
        return this.repo.find({ order: { code: 'ASC' } });
    }

    async findOne(id: string): Promise<Coupon> {
        const coupon = await this.repo.findOneBy({ id });
        if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
        return coupon;
    }

    create(data: CreateCouponDto): Promise<Coupon> {
        return this.repo.save(this.repo.create({ ...data, code: data.code.toUpperCase() }));
    }

    async update(id: string, data: UpdateCouponDto): Promise<Coupon> {
        await this.findOne(id);
        if (data.code) data.code = data.code.toUpperCase();
        await this.repo.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.repo.delete(id);
    }

    validate(code: string, subtotalAud: number): CouponValidation {
        return this.validateAsync(code, subtotalAud) as any;
    }

    async validateAsync(code: string, subtotalAud: number): Promise<CouponValidation> {
        const coupon = await this.repo.findOneBy({ code: code.toUpperCase(), active: true });
        if (!coupon) return { valid: false, message: 'Invalid or expired coupon code.' };

        if (coupon.minOrderAud && subtotalAud < Number(coupon.minOrderAud)) {
            return {
                valid: false,
                message: `Minimum order of $${Number(coupon.minOrderAud).toFixed(2)} required.`,
            };
        }

        const discountAud = coupon.type === 'percent'
            ? (subtotalAud * Number(coupon.value)) / 100
            : Math.min(Number(coupon.value), subtotalAud);

        return { valid: true, coupon, discountAud };
    }

    applyDiscount(totalCents: number, coupon: Coupon): number {
        if (coupon.type === 'percent') {
            return Math.round(totalCents * (1 - Number(coupon.value) / 100));
        }
        return Math.max(0, totalCents - Math.round(Number(coupon.value) * 100));
    }
}
