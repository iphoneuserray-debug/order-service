import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stripe } from 'node_modules/stripe/cjs/stripe.core';
import { Product } from '../products/product.entity';

export interface CartItem {
    productId: string;
    quantity: number;
}

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        @Inject('STRIPE_API_KEY') private readonly apiKey: string,
        @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    ) {
        this.stripe = new Stripe(this.apiKey, {
            apiVersion: '2026-03-25.dahlia',
        });
    }

    async createPaymentIntent(cart: CartItem[]): Promise<Stripe.PaymentIntent> {
        const productIds = cart.map(item => item.productId);
        const products = await this.productRepository.findBy(
            productIds.map(id => ({ id })),
        );

        if (products.length !== productIds.length) {
            throw new NotFoundException('One or more products not found');
        }

        const productMap = new Map(products.map(p => [p.id, p]));

        const totalAud = cart.reduce((sum, item) => {
            const product = productMap.get(item.productId)!;
            return sum + product.priceAud * item.quantity;
        }, 0);

        // Stripe expects amount in cents
        const amountInCents = Math.round(totalAud * 100);

        return this.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'aud',
        });
    }
}
