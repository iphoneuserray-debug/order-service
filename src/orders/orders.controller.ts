import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
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

    @Get('customer/:customerId')
    findByCustomer(@Param('customerId') customerId: string): Promise<Order[]> {
        return this.ordersService.findByCustomer(customerId);
    }

    @Post()
    create(@Body() body: CreateOrderDto): Promise<Order> {
        return this.ordersService.create(body);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: UpdateOrderStatusDto,
    ): Promise<Order> {
        return this.ordersService.updateStatus(id, body.status);
    }
}
