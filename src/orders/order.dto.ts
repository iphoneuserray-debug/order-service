import { IsBoolean } from 'class-validator';

export class UpdateOrderDto {
    @IsBoolean()
    completed: boolean;
}
