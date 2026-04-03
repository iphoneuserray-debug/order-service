import { Body, Controller, Get, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private stripeService: StripeService) { }

    @Post('PaymentIntent')
    async createPaymentIntent(@Body() body: { amount: number; currency: string }) {
        return await this.stripeService.createPaymentIntent(body.amount, body.currency);
    }
}
