import { BadRequestException, Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/order.entity';
import { CheckoutDto } from './payment.dto';

@Injectable()
export class PaymentService {
    constructor(
        private readonly stripeService: StripeService,
        private readonly customersService: CustomersService,
        private readonly ordersService: OrdersService,
    ) {}

    async checkout(data: CheckoutDto) {
        const session = await this.stripeService.createCheckoutSession(data.cart);
        return { url: session.url };
    }

    async handleWebhook(payload: Buffer, signature: string): Promise<void> {
        let event: any;
        try {
            event = this.stripeService.constructWebhookEvent(payload, signature);
        } catch {
            throw new BadRequestException('Invalid Stripe webhook signature');
        }

        if (event.type !== 'checkout.session.completed') return;

        const session = event.data.object;
        const cart = JSON.parse(session.metadata?.cart ?? '[]');
        const details = session.customer_details ?? {};

        // Find or create customer
        let customer = await this.customersService.findByEmail(details.email);
        if (!customer) {
            customer = await this.customersService.create({
                name: details.name,
                email: details.email,
                phone: details.phone ?? undefined,
            });
        }

        // Save order as PAID
        const order = await this.ordersService.create({
            customerId: customer.id,
            items: cart,
            paymentMethod: 'card',
            stripePaymentIntentId: session.payment_intent,
        });

        await this.ordersService.updateStatus(order.id, OrderStatus.PAID);
    }
}
