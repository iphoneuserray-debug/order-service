import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeSDK = require('stripe');
import { Product } from '../products/product.entity';
import { Coupon } from '../coupons/coupon.entity';

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone?: string;
    wechatNumber?: string;
    deliveryType: 'pickup' | 'delivery';
    deliveryAddress?: {
        line1: string;
        city: string;
        state: string;
        postalCode: string;
    };
    pickupLocationId?: string;
    scheduledDate?: string;
    scheduledTime?: string;
}

@Injectable()
export class StripeService {
    private stripe: any;

    constructor(
        @Inject('STRIPE_API_KEY') private readonly apiKey: string,
        @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    ) {
        this.stripe = new StripeSDK(this.apiKey, {
            apiVersion: '2026-03-25.dahlia',
        });
    }

    async createPaymentIntent(cart: CartItem[], customer: CustomerInfo, coupon?: Coupon): Promise<{ clientSecret: string }> {
        const productIds = cart.map(item => item.productId);
        const products = await this.productRepository.findBy(
            productIds.map(id => ({ id })),
        );

        if (products.length !== productIds.length) {
            throw new NotFoundException('One or more products not found');
        }

        const productMap = new Map(products.map(p => [p.id, p]));

        const totalAmount = cart.reduce((sum, item) => {
            const product = productMap.get(item.productId)!;
            return sum + Math.round(product.priceAud * 100) * item.quantity;
        }, 0);

        let finalAmount = totalAmount;
        if (coupon) {
            const subtotalAud = totalAmount / 100;
            if (coupon.minOrderAud && subtotalAud < Number(coupon.minOrderAud)) {
                throw new BadRequestException(`Minimum order of $${Number(coupon.minOrderAud).toFixed(2)} required for this coupon.`);
            }
            finalAmount = coupon.type === 'percent'
                ? Math.round(totalAmount * (1 - Number(coupon.value) / 100))
                : Math.max(0, totalAmount - Math.round(Number(coupon.value) * 100));
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: finalAmount,
            currency: 'aud',
            payment_method_types: ['card'],
            metadata: {
                cart: JSON.stringify(cart),
                customer: JSON.stringify(customer),
                ...(coupon && { couponCode: coupon.code }),
            },
        });

        return { clientSecret: paymentIntent.client_secret };
    }

    async getCharge(chargeId: string): Promise<any> {
        return this.stripe.charges.retrieve(chargeId);
    }

    constructWebhookEvent(payload: Buffer, signature: string) {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
