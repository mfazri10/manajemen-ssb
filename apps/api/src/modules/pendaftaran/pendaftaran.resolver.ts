import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { Pendaftaran } from './entities/pendaftaran.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class PendaftaranResolver {
  constructor(private readonly service: PendaftaranService) {}

  @Query(() => [Pendaftaran], { name: 'pendaftaran' })
  @RequirePermissions('pendaftaran.index')
  async getPendaftaran(
    @CurrentUser() userId: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug, status);
  }

  @Query(() => Pendaftaran, { name: 'pendaftaranById' })
  @RequirePermissions('pendaftaran.index')
  async getPendaftaranById(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findById(slug, id);
  }

  @Mutation(() => Pendaftaran, { name: 'createPendaftaran' })
  @RequirePermissions('pendaftaran.create')
  async createPendaftaran(
    @CurrentUser() userId: string,
    @Args('namaLengkap') namaLengkap: string,
    @Args('akademiId') akademiId: string,
    @Args('tempatLahir', { nullable: true }) tempatLahir?: string,
    @Args('tglLahir', { nullable: true }) tglLahir?: string,
    @Args('jenisKelamin', { nullable: true }) jenisKelamin?: string,
    @Args('alamat', { nullable: true }) alamat?: string,
    @Args('namaOrangTua', { nullable: true }) namaOrangTua?: string,
    @Args('noHpOrangTua', { nullable: true }) noHpOrangTua?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('kelompokUmurId', { nullable: true }) kelompokUmurId?: string,
    @Args('posisiId', { nullable: true }) posisiId?: string,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('dokumenUrl', { nullable: true }) dokumenUrl?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { namaLengkap, akademiId };
    for (const [k, v] of Object.entries({
      tempatLahir, tglLahir, jenisKelamin, alamat, namaOrangTua,
      noHpOrangTua, email, kelompokUmurId, posisiId, fotoUrl, dokumenUrl,
    })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.create(slug, data);
  }

  @Mutation(() => Pendaftaran, { name: 'updatePendaftaran' })
  @RequirePermissions('pendaftaran.update')
  async updatePendaftaran(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('namaLengkap', { nullable: true }) namaLengkap?: string,
    @Args('tempatLahir', { nullable: true }) tempatLahir?: string,
    @Args('tglLahir', { nullable: true }) tglLahir?: string,
    @Args('jenisKelamin', { nullable: true }) jenisKelamin?: string,
    @Args('alamat', { nullable: true }) alamat?: string,
    @Args('namaOrangTua', { nullable: true }) namaOrangTua?: string,
    @Args('noHpOrangTua', { nullable: true }) noHpOrangTua?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('kelompokUmurId', { nullable: true }) kelompokUmurId?: string,
    @Args('posisiId', { nullable: true }) posisiId?: string,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('dokumenUrl', { nullable: true }) dokumenUrl?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({
      namaLengkap, tempatLahir, tglLahir, jenisKelamin, alamat,
      namaOrangTua, noHpOrangTua, email, kelompokUmurId, posisiId, fotoUrl, dokumenUrl,
    })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deletePendaftaran' })
  @RequirePermissions('pendaftaran.delete')
  async deletePendaftaran(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }

  @Mutation(() => Pendaftaran, { name: 'verifikasiPendaftaran' })
  @RequirePermissions('pendaftaran.update')
  async verifikasiPendaftaran(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
    @Args('catatan', { nullable: true }) catatan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.verifikasi(slug, id, status, catatan);
  }
}
