import { Module } from '@nestjs/common';
import { DokumenSiswaResolver } from './dokumen-siswa.resolver';
import { DokumenSiswaService } from './dokumen-siswa.service';

@Module({
  providers: [DokumenSiswaResolver, DokumenSiswaService],
  exports: [DokumenSiswaService],
})
export class DokumenSiswaModule {}
