import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { PickupLocation } from '../pickup-locations/pickup-location.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, OrderItem, Order, Product, Customer, PickupLocation])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
