import { Module } from '@nestjs/common';
import { MateriResolver } from './materi.resolver';
import { MateriService } from './materi.service';

@Module({
  providers: [MateriResolver, MateriService],
  exports: [MateriService],
})
export class MateriModule {}
