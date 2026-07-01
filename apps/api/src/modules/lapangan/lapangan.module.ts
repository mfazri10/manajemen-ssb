import { Module } from '@nestjs/common';
import { LapanganResolver } from './lapangan.resolver';
import { LapanganService } from './lapangan.service';

@Module({
  providers: [LapanganResolver, LapanganService],
  exports: [LapanganService],
})
export class LapanganModule {}