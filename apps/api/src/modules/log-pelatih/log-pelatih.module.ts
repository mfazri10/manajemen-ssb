import { Module } from '@nestjs/common';
import { LogPelatihResolver } from './log-pelatih.resolver';
import { LogPelatihService } from './log-pelatih.service';

@Module({
  providers: [LogPelatihResolver, LogPelatihService],
  exports: [LogPelatihService],
})
export class LogPelatihModule {}
