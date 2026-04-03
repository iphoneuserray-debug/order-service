import { Body, Controller, Post } from '@nestjs/common';
import { CartItem, StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private stripeService: StripeService) { }

    @Post('PaymentIntent')
    async createPaymentIntent(@Body() body: { cart: CartItem[] }) {
        return await this.stripeService.createPaymentIntent(body.cart);
    }
}
