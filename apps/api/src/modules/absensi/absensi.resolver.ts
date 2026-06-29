import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AbsensiService } from './absensi.service';
import { Absensi } from './entities/absensi.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class AbsensiResolver {
  constructor(private readonly service: AbsensiService) {}

  @Query(() => [Absensi], { name: 'absensi' })
  @RequirePermissions('absensi.index')
  async getAll(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug);
  }

  @Query(() => [Absensi], { name: 'absensiByJadwal' })
  @RequirePermissions('absensi.index')
  async getByJadwal(@CurrentUser() userId: string, @Args('jadwalId', { type: () => ID }) jadwalId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findByJadwal(slug, jadwalId);
  }

  @Query(() => [Absensi], { name: 'absensiBySiswa' })
  @RequirePermissions('absensi.index')
  async getBySiswa(@CurrentUser() userId: string, @Args('siswaId', { type: () => ID }) siswaId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findBySiswa(slug, siswaId);
  }

  @Mutation(() => Absensi, { name: 'createAbsensi' })
  @RequirePermissions('absensi.create')
  async create(
    @CurrentUser() userId: string,
    @Args('jadwalId', { type: () => ID }) jadwalId: string,
    @Args('siswaId', { type: () => ID }) siswaId: string,
    @Args('tanggal') tanggal: string,
    @Args('status') status: string,
    @Args('keterangan', { nullable: true }) keterangan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { jadwalId, siswaId, tanggal, status };
    if (keterangan !== undefined) data.keterangan = keterangan;
    return this.service.create(slug, data as { jadwalId: string; siswaId: string; tanggal: string; status: string; keterangan?: string });
  }

  @Mutation(() => Absensi, { name: 'updateAbsensi' })
  @RequirePermissions('absensi.update')
  async update(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('keterangan', { nullable: true }) keterangan?: string,
    @Args('tanggal', { nullable: true }) tanggal?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (keterangan !== undefined) data.keterangan = keterangan;
    if (tanggal !== undefined) data.tanggal = tanggal;
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteAbsensi' })
  @RequirePermissions('absensi.delete')
  async delete(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }
}
