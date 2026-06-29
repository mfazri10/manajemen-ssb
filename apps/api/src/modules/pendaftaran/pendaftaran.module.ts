import { Module } from '@nestjs/common';
import { PendaftaranResolver } from './pendaftaran.resolver';
import { PendaftaranService } from './pendaftaran.service';

@Module({
  providers: [PendaftaranResolver, PendaftaranService],
  exports: [PendaftaranService],
})
export class PendaftaranModule {}
