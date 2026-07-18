import { Controller, Post, Body, Headers, HttpCode, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('v1/payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post('xendit-callback')
  @HttpCode(200)
  async handleXenditCallback(
    @Headers('x-callback-token') token: string,
    @Body() payload: any,
  ) {
    return this.service.handleXenditWebhook(token, payload);
  }
}
