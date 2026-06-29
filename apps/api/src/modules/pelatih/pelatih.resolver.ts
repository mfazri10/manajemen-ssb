import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PelatihService } from './pelatih.service';
import { Pelatih, PelatihLisensi, PelatihJabatan } from './entities/pelatih.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class PelatihResolver {
  constructor(private readonly service: PelatihService) {}

  @Query(() => [Pelatih], { name: 'pelatih' })
  @RequirePermissions('pelatih.index')
  async getAll(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug);
  }

  @Query(() => Pelatih, { name: 'pelatihById' })
  @RequirePermissions('pelatih.index')
  async getById(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findById(slug, id);
  }

  @Mutation(() => Pelatih, { name: 'createPelatih' })
  @RequirePermissions('pelatih.create')
  async create(
    @CurrentUser() userId: string,
    @Args('namaLengkap') namaLengkap: string,
    @Args('noHp', { nullable: true }) noHp?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('tempatLahir', { nullable: true }) tempatLahir?: string,
    @Args('tanggalLahir', { nullable: true }) tanggalLahir?: string,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('provinsi', { nullable: true }) provinsi?: string,
    @Args('kabupaten', { nullable: true }) kabupaten?: string,
    @Args('kecamatan', { nullable: true }) kecamatan?: string,
    @Args('desa', { nullable: true }) desa?: string,
    @Args('catatan', { nullable: true }) catatan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { namaLengkap };
    for (const [k, v] of Object.entries({ noHp, email, tempatLahir, tanggalLahir, fotoUrl, status, provinsi, kabupaten, kecamatan, desa, catatan })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.create(slug, data);
  }

  @Mutation(() => Pelatih, { name: 'updatePelatih' })
  @RequirePermissions('pelatih.update')
  async update(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('namaLengkap', { nullable: true }) namaLengkap?: string,
    @Args('noHp', { nullable: true }) noHp?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('tempatLahir', { nullable: true }) tempatLahir?: string,
    @Args('tanggalLahir', { nullable: true }) tanggalLahir?: string,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('provinsi', { nullable: true }) provinsi?: string,
    @Args('kabupaten', { nullable: true }) kabupaten?: string,
    @Args('kecamatan', { nullable: true }) kecamatan?: string,
    @Args('desa', { nullable: true }) desa?: string,
    @Args('catatan', { nullable: true }) catatan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ namaLengkap, noHp, email, tempatLahir, tanggalLahir, fotoUrl, status, provinsi, kabupaten, kecamatan, desa, catatan })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deletePelatih' })
  @RequirePermissions('pelatih.delete')
  async delete(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }

  // Lisensi
  @Query(() => [PelatihLisensi], { name: 'pelatihLisensi' })
  @RequirePermissions('pelatih.index')
  async getLisensi(@CurrentUser() userId: string, @Args('pelatihId', { type: () => ID }) pelatihId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findLisensi(slug, pelatihId);
  }

  @Mutation(() => PelatihLisensi, { name: 'createPelatihLisensi' })
  @RequirePermissions('pelatih.create')
  async createLisensi(
    @CurrentUser() userId: string,
    @Args('pelatihId', { type: () => ID }) pelatihId: string,
    @Args('lisensi') lisensi: string,
    @Args('lisensiLainnya', { nullable: true }) lisensiLainnya?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const lisensiData: Record<string, unknown> = { pelatihId, lisensi };
    if (lisensiLainnya !== undefined) lisensiData.lisensiLainnya = lisensiLainnya;
    return this.service.createLisensi(slug, lisensiData as { pelatihId: string; lisensi: string; lisensiLainnya?: string });
  }

  @Mutation(() => Boolean, { name: 'deletePelatihLisensi' })
  @RequirePermissions('pelatih.delete')
  async deleteLisensi(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteLisensi(slug, id);
  }

  // Jabatan
  @Query(() => [PelatihJabatan], { name: 'pelatihJabatan' })
  @RequirePermissions('pelatih.index')
  async getJabatan(@CurrentUser() userId: string, @Args('pelatihId', { type: () => ID }) pelatihId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findJabatan(slug, pelatihId);
  }

  @Mutation(() => PelatihJabatan, { name: 'createPelatihJabatan' })
  @RequirePermissions('pelatih.create')
  async createJabatan(
    @CurrentUser() userId: string,
    @Args('pelatihId', { type: () => ID }) pelatihId: string,
    @Args('jabatan') jabatan: string,
    @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const jabatanData: Record<string, unknown> = { pelatihId, jabatan };
    if (kelompokUmurId !== undefined) jabatanData.kelompokUmurId = kelompokUmurId;
    return this.service.createJabatan(slug, jabatanData as { pelatihId: string; jabatan: string; kelompokUmurId?: string });
  }

  @Mutation(() => Boolean, { name: 'deletePelatihJabatan' })
  @RequirePermissions('pelatih.delete')
  async deleteJabatan(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteJabatan(slug, id);
  }
}
