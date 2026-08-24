import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { XenditService } from './xendit.service';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [ConfigModule, AffiliateModule],
  controllers: [PaymentController],
  providers: [PaymentResolver, PaymentService, XenditService],
  exports: [PaymentService, XenditService],
})
export class PaymentModule {}
