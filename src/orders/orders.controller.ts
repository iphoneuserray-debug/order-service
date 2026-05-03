import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './order.dto';
import { Order } from './order.entity';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    findAll(): Promise<Order[]> {
        return this.ordersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Order> {
        return this.ordersService.findOne(id);
    }

    @Patch(':id')
    toggleCompleted(
        @Param('id') id: string,
        @Body() body: UpdateOrderDto,
    ): Promise<Order> {
        return this.ordersService.toggleCompleted(id, body.completed);
    }
}
