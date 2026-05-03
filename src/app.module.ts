import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StripeModule } from './stripe/stripe.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentModule } from './payment/payment.module';
import { Product } from './products/product.entity';
import { ProductImage } from './products/product-image.entity';
import { Customer } from './customers/customer.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { Transaction } from './transactions/transaction.entity';
import { PickupLocation } from './pickup-locations/pickup-location.entity';
import { PickupLocationsModule } from './pickup-locations/pickup-locations.module';
import { Coupon } from './coupons/coupon.entity';
import { CouponsModule } from './coupons/coupons.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
                entities: [Product, ProductImage, Customer, Order, OrderItem, Transaction, PickupLocation, Coupon],
                synchronize: true,
            }),
        }),
        StripeModule.forRootAsync(),
        ProductsModule,
        CustomersModule,
        OrdersModule,
        TransactionsModule,
        PaymentModule,
        PickupLocationsModule,
        CouponsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
