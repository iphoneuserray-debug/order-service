import { Injectable } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { StripeService } from '../stripe/stripe.service';
import { CheckoutDto } from './payment.dto';

@Injectable()
export class PaymentService {
    constructor(
        private readonly stripeService: StripeService,
        private readonly customersService: CustomersService,
        private readonly ordersService: OrdersService,
    ) {}

    async checkout(data: CheckoutDto) {
        // 1. Find or create customer
        let customer = await this.customersService.findByEmail(data.email);
        if (!customer) {
            customer = await this.customersService.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
            });
        }

        // 2. Create Stripe payment intent (amount calculated from DB prices)
        const paymentIntent = await this.stripeService.createPaymentIntent(data.cart);

        // 3. Create order record linked to customer and payment intent
        const order = await this.ordersService.create({
            customerId: customer.id,
            items: data.cart,
            paymentMethod: 'card',
            stripePaymentIntentId: paymentIntent.id,
        });

        // 4. Return client_secret to frontend to complete payment with Stripe.js
        return {
            clientSecret: paymentIntent.client_secret,
            orderId: order.id,
            totalAud: order.totalAud,
        };
    }
}
