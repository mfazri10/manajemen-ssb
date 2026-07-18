import { Module } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantResolver } from './tenant.resolver';

@Module({
  providers: [TenantProvisioningService, TenantResolver],
  exports: [TenantProvisioningService],
})
export class TenantModule {}

