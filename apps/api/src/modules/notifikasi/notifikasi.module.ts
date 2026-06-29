import { Module } from '@nestjs/common';
import { NotifikasiResolver } from './notifikasi.resolver';
import { NotifikasiService } from './notifikasi.service';

@Module({
  providers: [NotifikasiResolver, NotifikasiService],
  exports: [NotifikasiService],
})
export class NotifikasiModule {}
