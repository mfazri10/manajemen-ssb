import { Module } from '@nestjs/common';
import { RoleResolver } from './role.resolver';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';

@Module({
  providers: [RoleResolver, RoleService, RoleRepository],
  exports: [RoleService],
})
export class RoleModule {}
