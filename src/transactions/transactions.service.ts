import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './transaction.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { PickupLocation } from '../pickup-locations/pickup-location.entity';
import { CreateTransactionDto } from './transaction.dto';

const TX_RELATIONS = ['customer', 'items', 'items.product', 'order', 'pickupLocation'];

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(PickupLocation)
        private readonly pickupLocationRepository: Repository<PickupLocation>,
    ) {}

    findAll(): Promise<Transaction[]> {
        return this.transactionRepository.find({ relations: TX_RELATIONS });
    }

    async findOne(id: string): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: TX_RELATIONS,
        });
        if (!transaction) throw new NotFoundException(`Transaction ${id} not found`);
        return transaction;
    }

    findByCustomer(customerId: string): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: { customer: { id: customerId } },
            relations: ['items', 'items.product', 'pickupLocation'],
        });
    }

    async create(data: CreateTransactionDto): Promise<Transaction> {
        let customer: Customer | undefined;
        if (data.customerId) {
            customer = await this.customerRepository.findOneBy({ id: data.customerId }) ?? undefined;
            if (!customer) throw new NotFoundException(`Customer ${data.customerId} not found`);
        }

        let pickupLocation: PickupLocation | undefined;
        if (data.pickupLocationId) {
            pickupLocation = await this.pickupLocationRepository.findOneBy({ id: data.pickupLocationId }) ?? undefined;
            if (!pickupLocation) throw new NotFoundException(`Pickup location ${data.pickupLocationId} not found`);
        }

        const productIds = data.items.map(i => i.productId);
        const products = await this.productRepository.findBy(productIds.map(id => ({ id })));
        if (products.length !== productIds.length) {
            throw new NotFoundException('One or more products not found');
        }

        const productMap = new Map(products.map(p => [p.id, p]));

        const items = data.items.map(i => {
            const product = productMap.get(i.productId)!;
            return this.orderItemRepository.create({
                product,
                quantity: i.quantity,
                priceAud: product.priceAud,
            });
        });

        const totalAud = items.reduce((sum, item) => sum + item.priceAud * item.quantity, 0);

        const transaction = this.transactionRepository.create({
            customer,
            items,
            totalAud,
            paymentMethod: data.paymentMethod ?? 'card',
            deliveryType: data.deliveryType,
            deliveryAddress: data.deliveryAddress,
            pickupLocation,
            stripePaymentIntentId: data.stripePaymentIntentId,
            note: data.note,
        });

        const saved = await this.transactionRepository.save(transaction);

        const order = this.orderRepository.create({ transaction: saved });
        await this.orderRepository.save(order);

        return saved;
    }

    async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
        await this.findOne(id);
        await this.transactionRepository.update(id, { status });
        return this.findOne(id);
    }
}
