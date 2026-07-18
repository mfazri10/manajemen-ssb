import { Module } from '@nestjs/common';
import { SppResolver } from './spp.resolver';
import { SppService } from './spp.service';
import { SppSchedulerService } from './spp-scheduler.service';

@Module({
  providers: [SppResolver, SppService, SppSchedulerService],
  exports: [SppService, SppSchedulerService],
})
export class SppModule {}
