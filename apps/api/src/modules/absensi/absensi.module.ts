import { Module } from '@nestjs/common';
import { AbsensiResolver } from './absensi.resolver';
import { AbsensiService } from './absensi.service';

@Module({
  providers: [AbsensiResolver, AbsensiService],
  exports: [AbsensiService],
})
export class AbsensiModule {}
