import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    findAll(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: ['transaction', 'transaction.customer', 'transaction.items', 'transaction.items.product'],
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['transaction', 'transaction.customer', 'transaction.items', 'transaction.items.product'],
        });
        if (!order) throw new NotFoundException(`Order ${id} not found`);
        return order;
    }

    async toggleCompleted(id: string, completed: boolean): Promise<Order> {
        await this.findOne(id);
        await this.orderRepository.update(id, { completed });
        return this.findOne(id);
    }
}
