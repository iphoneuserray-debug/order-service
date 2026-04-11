import { Body, Controller, Post } from '@nestjs/common';
import { CartItem, StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private stripeService: StripeService) { }

    @Post('checkout-session')
    async createCheckoutSession(@Body() body: { cart: CartItem[] }) {
        return await this.stripeService.createCheckoutSession(body.cart);
    }
}
