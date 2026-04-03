import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { Customer } from '../customers/customer.entity';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) {}

    findAll(): Promise<Order[]> {
        return this.orderRepository.find({ relations: ['customer', 'items', 'items.product'] });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product'],
        });
        if (!order) throw new NotFoundException(`Order ${id} not found`);
        return order;
    }

    findByCustomer(customerId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { customer: { id: customerId } },
            relations: ['items', 'items.product'],
        });
    }

    async create(data: CreateOrderDto): Promise<Order> {
        const customer = await this.customerRepository.findOneBy({ id: data.customerId });
        if (!customer) throw new NotFoundException(`Customer ${data.customerId} not found`);

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

        const order = this.orderRepository.create({
            customer,
            items,
            totalAud,
            paymentMethod: data.paymentMethod ?? 'card',
            stripePaymentIntentId: data.stripePaymentIntentId,
        });

        return this.orderRepository.save(order);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        await this.findOne(id);
        await this.orderRepository.update(id, { status });
        return this.findOne(id);
    }
}
