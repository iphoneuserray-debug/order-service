import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { CheckoutDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('checkout')
    checkout(@Body() body: CheckoutDto) {
        return this.paymentService.checkout(body);
    }

    @Post('webhook')
    webhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        return this.paymentService.handleWebhook(req.rawBody!, signature);
    }
}
