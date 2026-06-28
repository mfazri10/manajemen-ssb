import { Module } from '@nestjs/common';
import { MasterDataResolver } from './master-data.resolver';
import { MasterDataService } from './master-data.service';

@Module({
  providers: [MasterDataResolver, MasterDataService],
  exports: [MasterDataService],
})
export class MasterDataModule {}
