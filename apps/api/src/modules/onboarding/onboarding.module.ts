import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingResolver } from './onboarding.resolver';
import { DrizzleModule } from '../../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [OnboardingService, OnboardingResolver],
  exports: [OnboardingService],
})
export class OnboardingModule {}
