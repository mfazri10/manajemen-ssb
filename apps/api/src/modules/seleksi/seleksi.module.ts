import { Module } from '@nestjs/common';
import { SeleksiResolver } from './seleksi.resolver';
import { SeleksiService } from './seleksi.service';

@Module({
  providers: [SeleksiResolver, SeleksiService],
  exports: [SeleksiService],
})
export class SeleksiModule {}
