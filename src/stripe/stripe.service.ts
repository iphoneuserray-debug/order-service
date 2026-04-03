import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'node_modules/stripe/cjs/stripe.core';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(@Inject('STRIPE_API_KEY') private readonly apiKey: string) {
        this.stripe = new Stripe(this.apiKey, {
            apiVersion: '2026-03-25.dahlia',
        });
    }

    async createPaymentIntent(amount: number, currency: string): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({
            amount,
            currency,
        });
    }
}