import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentIntentDto {
    @ApiProperty({ example: 48.90 })
    @IsString()
    amount!: number;

    @ApiProperty({ example: 'AUD' })
    @IsString()
    currency!: string;
}