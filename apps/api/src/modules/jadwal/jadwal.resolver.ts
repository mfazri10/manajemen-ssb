import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { JadwalLatihan } from './entities/jadwal.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class JadwalResolver {
  constructor(private readonly service: JadwalService) {}

  @Query(() => [JadwalLatihan], { name: 'jadwalLatihan' })
  @RequirePermissions('jadwal.index')
  async getAll(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug);
  }

  @Query(() => JadwalLatihan, { name: 'jadwalById' })
  @RequirePermissions('jadwal.index')
  async getById(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findById(slug, id);
  }

  @Mutation(() => JadwalLatihan, { name: 'createJadwal' })
  @RequirePermissions('jadwal.create')
  async create(
    @CurrentUser() userId: string,
    @Args('hari', { nullable: true }) hari?: string,
    @Args('waktuMulai', { nullable: true }) waktuMulai?: string,
    @Args('waktuSelesai', { nullable: true }) waktuSelesai?: string,
    @Args('lokasi', { nullable: true }) lokasi?: string,
    @Args('materi', { nullable: true }) materi?: string,
    @Args('tanggal', { nullable: true }) tanggal?: string,
    @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ hari, waktuMulai, waktuSelesai, lokasi, materi, tanggal, kelompokUmurId, status })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.create(slug, data);
  }

  @Mutation(() => JadwalLatihan, { name: 'updateJadwal' })
  @RequirePermissions('jadwal.update')
  async update(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('hari', { nullable: true }) hari?: string,
    @Args('waktuMulai', { nullable: true }) waktuMulai?: string,
    @Args('waktuSelesai', { nullable: true }) waktuSelesai?: string,
    @Args('lokasi', { nullable: true }) lokasi?: string,
    @Args('materi', { nullable: true }) materi?: string,
    @Args('tanggal', { nullable: true }) tanggal?: string,
    @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ hari, waktuMulai, waktuSelesai, lokasi, materi, tanggal, kelompokUmurId, status })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteJadwal' })
  @RequirePermissions('jadwal.delete')
  async delete(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }
}
