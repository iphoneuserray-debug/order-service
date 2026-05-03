import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
    @IsString()
    code: string;

    @IsEnum(['percent', 'fixed'])
    type: 'percent' | 'fixed';

    @IsNumber()
    @Min(0)
    value: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderAud?: number;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}

export class UpdateCouponDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsEnum(['percent', 'fixed'])
    type?: 'percent' | 'fixed';

    @IsOptional()
    @IsNumber()
    @Min(0)
    value?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderAud?: number;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
