import { BadRequestException, Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CustomersService } from '../customers/customers.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CouponsService } from '../coupons/coupons.service';
import { TransactionStatus } from '../transactions/transaction.entity';
import { CheckoutDto } from './payment.dto';

@Injectable()
export class PaymentService {
    constructor(
        private readonly stripeService: StripeService,
        private readonly customersService: CustomersService,
        private readonly transactionsService: TransactionsService,
        private readonly couponsService: CouponsService,
    ) {}

    async checkout(data: CheckoutDto) {
        const { cart, couponCode, ...customer } = data;

        let coupon: import('../coupons/coupon.entity').Coupon | undefined;
        if (couponCode) {
            const result = await this.couponsService.validateAsync(couponCode, Infinity);
            if (!result.valid || !result.coupon) {
                throw new BadRequestException(result.message ?? 'Invalid coupon code.');
            }
            coupon = result.coupon;
        }

        return this.stripeService.createPaymentIntent(cart, customer, coupon);
    }

    async handleWebhook(payload: Buffer, signature: string): Promise<void> {
        let event: any;
        try {
            event = this.stripeService.constructWebhookEvent(payload, signature);
        } catch {
            throw new BadRequestException('Invalid Stripe webhook signature');
        }

        if (event.type !== 'payment_intent.succeeded') return;

        const paymentIntent = event.data.object;
        const cart = JSON.parse(paymentIntent.metadata?.cart ?? '[]');
        const customerInfo = JSON.parse(paymentIntent.metadata?.customer ?? '{}');

        let customerId: string | undefined;
        if (customerInfo.email) {
            let customer = await this.customersService.findByEmail(customerInfo.email);
            if (!customer) {
                customer = await this.customersService.create({
                    name: customerInfo.name ?? '',
                    email: customerInfo.email,
                    phone: customerInfo.phone ?? undefined,
                    wechatNumber: customerInfo.wechatNumber ?? undefined,
                });
            }
            customerId = customer.id;
        }

        const deliveryAddress = customerInfo.deliveryAddress
            ? [customerInfo.deliveryAddress.line1, customerInfo.deliveryAddress.city, customerInfo.deliveryAddress.state, customerInfo.deliveryAddress.postalCode].filter(Boolean).join(', ')
            : undefined;

        // Save transaction as PAID (auto-creates a fulfillment Order)
        const transaction = await this.transactionsService.create({
            customerId,
            items: cart,
            paymentMethod: 'card',
            stripePaymentIntentId: paymentIntent.id,
            deliveryType: customerInfo.deliveryType,
            deliveryAddress,
            pickupLocationId: customerInfo.pickupLocationId,
            scheduledDate: customerInfo.scheduledDate,
            scheduledTime: customerInfo.scheduledTime,
        });

        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.PAID);
    }
}
