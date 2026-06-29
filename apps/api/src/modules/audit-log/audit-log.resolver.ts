import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './entities/audit-log.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class AuditLogResolver {
  constructor(private readonly service: AuditLogService) {}

  @Query(() => [AuditLog], { name: 'auditLog' })
  @RequirePermissions('audit-log.index')
  async getAuditLog(
    @CurrentUser() userId: string,
    @Args('akademiId') akademiId: string,
    @Args('entitas', { nullable: true }) entitas?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug, akademiId, entitas, limit);
  }

  @Query(() => [AuditLog], { name: 'recentActivity' })
  @RequirePermissions('audit-log.index')
  async getRecentActivity(
    @CurrentUser() userId: string,
    @Args('akademiId') akademiId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findRecentActivity(slug, akademiId, limit);
  }

  @Mutation(() => AuditLog, { name: 'createAuditLog' })
  async createAuditLog(
    @CurrentUser() userId: string,
    @Args('akademiId') akademiId: string,
    @Args('aksi') aksi: string,
    @Args('entitas', { nullable: true }) entitas?: string,
    @Args('entitasId', { nullable: true }) entitasId?: string,
    @Args('dataLama', { nullable: true }) dataLama?: string,
    @Args('dataBaru', { nullable: true }) dataBaru?: string,
    @Args('ipAddress', { nullable: true }) ipAddress?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { akademiId, aksi, userId };
    for (const [k, v] of Object.entries({ entitas, entitasId, dataLama, dataBaru, ipAddress })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.create(slug, data);
  }
}
