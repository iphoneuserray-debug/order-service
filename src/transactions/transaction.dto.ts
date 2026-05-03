import { IsArray, IsEnum, IsOptional, IsString, IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType, TransactionStatus } from './transaction.entity';

export class CreateTransactionItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateTransactionDto {
    @IsOptional()
    @IsUUID()
    customerId?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTransactionItemDto)
    items: CreateTransactionItemDto[];

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsEnum(DeliveryType)
    deliveryType?: DeliveryType;

    @IsOptional()
    @IsString()
    deliveryAddress?: string;

    @IsOptional()
    @IsUUID()
    pickupLocationId?: string;

    @IsOptional()
    @IsString()
    stripePaymentIntentId?: string;

    @IsOptional()
    @IsString()
    note?: string;
}

export class UpdateTransactionStatusDto {
    @IsEnum(TransactionStatus)
    status: TransactionStatus;
}
