import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePickupLocationDto {
    @IsString()
    name: string;

    @IsString()
    address: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}

export class UpdatePickupLocationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
