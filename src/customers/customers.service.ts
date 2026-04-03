import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) {}

    findAll(): Promise<Customer[]> {
        return this.customerRepository.find();
    }

    async findOne(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['orders'],
        });
        if (!customer) throw new NotFoundException(`Customer ${id} not found`);
        return customer;
    }

    findByEmail(email: string): Promise<Customer | null> {
        return this.customerRepository.findOneBy({ email });
    }

    async create(data: CreateCustomerDto): Promise<Customer> {
        const existing = await this.customerRepository.findOneBy({ email: data.email });
        if (existing) throw new ConflictException('Email already in use');
        const customer = this.customerRepository.create(data);
        return this.customerRepository.save(customer);
    }

    async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
        await this.findOne(id);
        await this.customerRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.customerRepository.delete(id);
    }
}
