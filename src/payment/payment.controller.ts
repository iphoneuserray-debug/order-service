import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CheckoutDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('checkout')
    checkout(@Body() body: CheckoutDto) {
        return this.paymentService.checkout(body);
    }
}
