import { Body, Controller, Post } from '@nestjs/common';
import { CartItem, CustomerInfo, StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private stripeService: StripeService) { }

    @Post('checkout-session')
    async createCheckoutSession(@Body() body: { cart: CartItem[] } & CustomerInfo) {
        const { cart, ...customer } = body;
        return await this.stripeService.createPaymentIntent(cart, customer);
    }
}
