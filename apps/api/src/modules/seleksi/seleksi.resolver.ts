import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SeleksiService } from './seleksi.service';
import { Seleksi, SeleksiPeserta } from './entities/seleksi.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class SeleksiResolver {
  constructor(private readonly service: SeleksiService) {}

  @Query(() => [Seleksi], { name: 'seleksi' })
  @RequirePermissions('siswa.index')
  async getSeleksi(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug);
  }

  @Mutation(() => Seleksi, { name: 'createSeleksi' })
  @RequirePermissions('siswa.create')
  async createSeleksi(@CurrentUser() userId: string, @Args('nama') nama: string, @Args('tanggal', { nullable: true }) tanggal?: string, @Args('lokasi', { nullable: true }) lokasi?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { nama };
    for (const [k, v] of Object.entries({ tanggal, lokasi, keterangan })) { if (v !== undefined) data[k] = v; }
    return this.service.create(slug, data);
  }

  @Mutation(() => Seleksi, { name: 'updateSeleksi' })
  @RequirePermissions('siswa.update')
  async updateSeleksi(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('nama', { nullable: true }) nama?: string, @Args('tanggal', { nullable: true }) tanggal?: string, @Args('lokasi', { nullable: true }) lokasi?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ nama, tanggal, lokasi, keterangan })) { if (v !== undefined) data[k] = v; }
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteSeleksi' })
  @RequirePermissions('siswa.delete')
  async deleteSeleksi(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }

  // ========== PESERTA ==========
  @Query(() => [SeleksiPeserta], { name: 'seleksiPeserta' })
  @RequirePermissions('siswa.index')
  async getPeserta(@CurrentUser() userId: string, @Args('seleksiId', { type: () => ID }) seleksiId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findPeserta(slug, seleksiId);
  }

  @Mutation(() => SeleksiPeserta, { name: 'createSeleksiPeserta' })
  @RequirePermissions('siswa.create')
  async createPeserta(@CurrentUser() userId: string, @Args('seleksiId', { type: () => ID }) seleksiId: string, @Args('siswaId', { type: () => ID }) siswaId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.createPeserta(slug, { seleksiId, siswaId });
  }

  @Mutation(() => SeleksiPeserta, { name: 'updateSeleksiPeserta' })
  @RequirePermissions('siswa.update')
  async updatePeserta(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('status', { nullable: true }) status?: string, @Args('nilai', { type: () => Float, nullable: true }) nilai?: number, @Args('catatan', { nullable: true }) catatan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ status, nilai, catatan })) { if (v !== undefined) data[k] = v; }
    return this.service.updatePeserta(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteSeleksiPeserta' })
  @RequirePermissions('siswa.delete')
  async deletePeserta(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deletePeserta(slug, id);
  }
}
