import { Module } from '@nestjs/common';
import { PelatihResolver } from './pelatih.resolver';
import { PelatihService } from './pelatih.service';

@Module({
  providers: [PelatihResolver, PelatihService],
  exports: [PelatihService],
})
export class PelatihModule {}
