import { Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CheckoutDto } from './payment.dto';

@Injectable()
export class PaymentService {
    constructor(private readonly stripeService: StripeService) {}

    async checkout(data: CheckoutDto) {
        const session = await this.stripeService.createCheckoutSession(data.cart);
        return { url: session.url };
    }
}
