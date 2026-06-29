import { Module } from '@nestjs/common';
import { KeuanganEvaluasiResolver } from './keuangan-evaluasi.resolver';
import { KeuanganEvaluasiService } from './keuangan-evaluasi.service';

@Module({
  providers: [KeuanganEvaluasiResolver, KeuanganEvaluasiService],
  exports: [KeuanganEvaluasiService],
})
export class KeuanganEvaluasiModule {}
