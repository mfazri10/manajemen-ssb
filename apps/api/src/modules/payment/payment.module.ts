import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { XenditService } from './xendit.service';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentResolver, PaymentService, XenditService],
  exports: [PaymentService, XenditService],
})
export class PaymentModule {}
