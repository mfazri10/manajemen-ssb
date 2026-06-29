import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LogPelatihService } from './log-pelatih.service';
import { LogPelatih } from './entities/log-pelatih.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class LogPelatihResolver {
  constructor(private readonly service: LogPelatihService) {}

  @Query(() => [LogPelatih], { name: 'logPelatih' })
  @RequirePermissions('siswa.index')
  async getLogs(@CurrentUser() userId: string, @Args('pelatihId', { type: () => ID, nullable: true }) pelatihId?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    if (pelatihId) return this.service.findByPelatih(slug, pelatihId);
    return this.service.findAll(slug);
  }

  @Mutation(() => LogPelatih, { name: 'createLogPelatih' })
  @RequirePermissions('siswa.create')
  async createLog(@CurrentUser() userId: string, @Args('pelatihId', { type: () => ID }) pelatihId: string, @Args('tanggal') tanggal: string, @Args('kegiatan') kegiatan: string, @Args('jadwalId', { type: () => ID, nullable: true }) jadwalId?: string, @Args('materiId', { type: () => ID, nullable: true }) materiId?: string, @Args('catatan', { nullable: true }) catatan?: string, @Args('durasiMenit', { type: () => Int, nullable: true }) durasiMenit?: number) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { pelatihId, tanggal, kegiatan };
    for (const [k, v] of Object.entries({ jadwalId, materiId, catatan, durasiMenit })) { if (v !== undefined) data[k] = v; }
    return this.service.create(slug, data);
  }

  @Mutation(() => LogPelatih, { name: 'updateLogPelatih' })
  @RequirePermissions('siswa.update')
  async updateLog(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('kegiatan', { nullable: true }) kegiatan?: string, @Args('catatan', { nullable: true }) catatan?: string, @Args('durasiMenit', { type: () => Int, nullable: true }) durasiMenit?: number) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ kegiatan, catatan, durasiMenit })) { if (v !== undefined) data[k] = v; }
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteLogPelatih' })
  @RequirePermissions('siswa.delete')
  async deleteLog(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }
}
