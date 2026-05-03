import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeModule } from '../stripe/stripe.module';
import { CustomersModule } from '../customers/customers.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
    imports: [StripeModule.forRootAsync(), CustomersModule, TransactionsModule, CouponsModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
