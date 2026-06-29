import { Module } from '@nestjs/common';
import { SppResolver } from './spp.resolver';
import { SppService } from './spp.service';

@Module({
  providers: [SppResolver, SppService],
  exports: [SppService],
})
export class SppModule {}
