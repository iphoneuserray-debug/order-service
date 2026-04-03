import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeModule } from '../stripe/stripe.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [StripeModule.forRootAsync(), CustomersModule, OrdersModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
