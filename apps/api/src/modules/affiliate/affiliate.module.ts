import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../drizzle/drizzle.module';
import { AffiliateService } from './affiliate.service';
import { AffiliateCommissionService } from './affiliate-commission.service';
import { AffiliateTrackingService } from './affiliate-tracking.service';
import { AffiliatePayoutService } from './affiliate-payout.service';
import { AffiliateCronService } from './affiliate-cron.service';
import { AffiliateResolver } from './affiliate.resolver';

@Module({
  imports: [DrizzleModule],
  providers: [
    AffiliateService,
    AffiliateCommissionService,
    AffiliateTrackingService,
    AffiliatePayoutService,
    AffiliateCronService,
    AffiliateResolver,
  ],
  exports: [
    AffiliateService,
    AffiliateTrackingService,
  ],
})
export class AffiliateModule {}
