import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UpdateRolePermissionsInput } from './dto/update-role-permissions.input';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query(() => [Role], { name: 'roles' })
  @RequirePermissions('user.manage')
  async getRoles() {
    return this.roleService.findAllRoles();
  }

  @Query(() => [Permission], { name: 'permissions' })
  @RequirePermissions('user.manage')
  async getPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Mutation(() => Role, { name: 'createRole' })
  @RequirePermissions('user.manage')
  async createRole(
    @Args('name') name: string,
    @Args('label', { nullable: true }) label?: string,
  ) {
    const data: { name: string; label?: string } = { name };
    if (label !== undefined) data.label = label;
    return this.roleService.createRole(data);
  }

  @Mutation(() => Role, { name: 'updateRole' })
  @RequirePermissions('user.manage')
  async updateRole(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
    @Args('label', { nullable: true }) label?: string,
  ) {
    const data: { name: string; label?: string } = { name };
    if (label !== undefined) data.label = label;
    return this.roleService.updateRole(id, data);
  }

  @Mutation(() => Role, { name: 'deleteRole' })
  @RequirePermissions('user.manage')
  async deleteRole(@Args('id', { type: () => Int }) id: number) {
    return this.roleService.deleteRole(id);
  }

  @Mutation(() => Boolean, { name: 'createFeature' })
  @RequirePermissions('user.manage')
  async createFeature(
    @Args('id') id: string,
    @Args('label') label: string,
    @Args('fungsi', { type: () => [String] }) fungsi: string[],
  ) {
    await this.roleService.createFeature(id, label, fungsi);
    return true;
  }

  @Mutation(() => Boolean, { name: 'updateFeature' })
  @RequirePermissions('user.manage')
  async updateFeature(
    @Args('oldId') oldId: string,
    @Args('newId') newId: string,
    @Args('label') label: string,
    @Args('fungsi', { type: () => [String] }) fungsi: string[],
  ) {
    return this.roleService.updateFeature(oldId, newId, label, fungsi);
  }

  @Mutation(() => Boolean, { name: 'deleteFeature' })
  @RequirePermissions('user.manage')
  async deleteFeature(@Args('id') id: string) {
    return this.roleService.deleteFeature(id);
  }

  @Mutation(() => Role, { name: 'updateRolePermissions' })
  @RequirePermissions('user.manage')
  async updateRolePermissions(@Args('input', { type: () => UpdateRolePermissionsInput }) input: UpdateRolePermissionsInput) {
    return this.roleService.updateRolePermissions(input.roleId, input.permissionIds);
  }
}
