import { Module } from '@nestjs/common';
import { JadwalResolver } from './jadwal.resolver';
import { JadwalService } from './jadwal.service';

@Module({
  providers: [JadwalResolver, JadwalService],
  exports: [JadwalService],
})
export class JadwalModule {}
