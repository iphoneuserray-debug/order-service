import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CartItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CheckoutDto {
    // Customer info — used to find or create customer
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    cart: CartItemDto[];
}
