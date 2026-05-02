import { IsEmail, IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    wechatNumber?: string;
}

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    wechatNumber?: string;
}
