import { Module } from '@nestjs/common';
import { SiswaResolver } from './siswa.resolver';
import { SiswaService } from './siswa.service';

@Module({
  providers: [SiswaResolver, SiswaService],
  exports: [SiswaService],
})
export class SiswaModule {}
