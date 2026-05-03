import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionStatusDto } from './transaction.dto';
import { Transaction } from './transaction.entity';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get()
    findAll(): Promise<Transaction[]> {
        return this.transactionsService.findAll();
    }

    @Get('customer/:customerId')
    findByCustomer(@Param('customerId') customerId: string): Promise<Transaction[]> {
        return this.transactionsService.findByCustomer(customerId);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Transaction> {
        return this.transactionsService.findOne(id);
    }

    @Post()
    create(@Body() body: CreateTransactionDto): Promise<Transaction> {
        return this.transactionsService.create(body);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: UpdateTransactionStatusDto,
    ): Promise<Transaction> {
        return this.transactionsService.updateStatus(id, body.status);
    }
}
