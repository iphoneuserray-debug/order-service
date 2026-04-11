import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class CartItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CheckoutDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    cart: CartItemDto[];
}
