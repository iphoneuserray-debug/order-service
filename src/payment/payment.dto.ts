import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CartItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class DeliveryAddressDto {
    @IsString()
    line1: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    postalCode: string;
}

export class CheckoutDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    cart: CartItemDto[];

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    wechatNumber?: string;

    @IsEnum(['pickup', 'delivery'])
    deliveryType: 'pickup' | 'delivery';

    @IsOptional()
    @ValidateNested()
    @Type(() => DeliveryAddressDto)
    deliveryAddress?: DeliveryAddressDto;

    @IsOptional()
    @IsUUID()
    pickupLocationId?: string;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsOptional()
    @IsString()
    scheduledDate?: string;

    @IsOptional()
    @IsString()
    scheduledTime?: string;
}
