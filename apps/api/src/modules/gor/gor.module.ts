import { Module } from '@nestjs/common';
import { GorResolver } from './gor.resolver';
import { GorService } from './gor.service';

@Module({
  providers: [GorResolver, GorService],
  exports: [GorService],
})
export class GorModule {}