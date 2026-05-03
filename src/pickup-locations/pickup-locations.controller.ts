import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { PickupLocationsService } from './pickup-locations.service';
import { CreatePickupLocationDto, UpdatePickupLocationDto } from './pickup-location.dto';

@Controller('pickup-locations')
export class PickupLocationsController {
    constructor(private readonly pickupLocationsService: PickupLocationsService) {}

    @Get()
    findAll() {
        return this.pickupLocationsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.pickupLocationsService.findActive();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pickupLocationsService.findOne(id);
    }

    @Post()
    create(@Body() body: CreatePickupLocationDto) {
        return this.pickupLocationsService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdatePickupLocationDto) {
        return this.pickupLocationsService.update(id, body);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: string) {
        return this.pickupLocationsService.remove(id);
    }
}
