import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupLocation } from './pickup-location.entity';
import { CreatePickupLocationDto, UpdatePickupLocationDto } from './pickup-location.dto';

const DEFAULT_LOCATIONS = [
    { name: 'Melbourne Central', address: '211 La Trobe St, Melbourne VIC 3000' },
    { name: 'Southbank Melbourne Square', address: '696 Collins St, Melbourne VIC 3008' },
];

@Injectable()
export class PickupLocationsService implements OnModuleInit {
    constructor(
        @InjectRepository(PickupLocation)
        private readonly repo: Repository<PickupLocation>,
    ) {}

    async onModuleInit() {
        const count = await this.repo.count();
        if (count === 0) {
            await this.repo.save(DEFAULT_LOCATIONS.map(d => this.repo.create(d)));
        }
    }

    findAll(): Promise<PickupLocation[]> {
        return this.repo.find({ order: { name: 'ASC' } });
    }

    findActive(): Promise<PickupLocation[]> {
        return this.repo.find({ where: { active: true }, order: { name: 'ASC' } });
    }

    async findOne(id: string): Promise<PickupLocation> {
        const location = await this.repo.findOneBy({ id });
        if (!location) throw new NotFoundException(`Pickup location ${id} not found`);
        return location;
    }

    create(data: CreatePickupLocationDto): Promise<PickupLocation> {
        return this.repo.save(this.repo.create(data));
    }

    async update(id: string, data: UpdatePickupLocationDto): Promise<PickupLocation> {
        await this.findOne(id);
        await this.repo.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.repo.delete(id);
    }
}
