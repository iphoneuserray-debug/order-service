import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeSDK = require('stripe');
import { Product } from '../products/product.entity';

export interface CartItem {
    productId: string;
    quantity: number;
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

    async createCheckoutSession(cart: CartItem[]): Promise<any> {
        const productIds = cart.map(item => item.productId);
        const products = await this.productRepository.findBy(
            productIds.map(id => ({ id })),
        );

        if (products.length !== productIds.length) {
            throw new NotFoundException('One or more products not found');
        }

        const productMap = new Map(products.map(p => [p.id, p]));

        const lineItems = cart.map(item => {
            const product = productMap.get(item.productId)!;
            return {
                price_data: {
                    currency: 'aud',
                    unit_amount: Math.round(product.priceAud * 100),
                    product_data: { name: product.name },
                },
                quantity: item.quantity,
            };
        });

        return this.stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: process.env.SUCCESS_URL ?? 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.CANCEL_URL ?? 'http://localhost:3001/cancel',
        });
    }
}
