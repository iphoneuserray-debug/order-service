import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';
import { Customer } from './customer.entity';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Get()
    findAll(): Promise<Customer[]> {
        return this.customersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Customer> {
        return this.customersService.findOne(id);
    }

    @Post()
    create(@Body() body: CreateCustomerDto): Promise<Customer> {
        return this.customersService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateCustomerDto): Promise<Customer> {
        return this.customersService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(id);
    }
}
