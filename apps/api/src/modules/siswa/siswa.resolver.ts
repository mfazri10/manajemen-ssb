import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { Siswa } from './entities/siswa.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class SiswaResolver {
  constructor(private readonly siswaService: SiswaService) {}

  @Query(() => [Siswa], { name: 'siswa' })
  @RequirePermissions('siswa.index')
  async getAllSiswa(@CurrentUser() userId: string) {
    const slug = await this.siswaService.resolveTenantSlug(userId);
    return this.siswaService.findAll(slug);
  }

  @Query(() => Siswa, { name: 'siswaById' })
  @RequirePermissions('siswa.index')
  async getSiswaById(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.siswaService.resolveTenantSlug(userId);
    return this.siswaService.findById(slug, id);
  }

  @Mutation(() => Siswa, { name: 'createSiswa' })
  @RequirePermissions('siswa.create')
  async createSiswa(
    @CurrentUser() userId: string,
    @Args('namaLengkap') namaLengkap: string,
    @Args('tanggalLahir') tanggalLahir: string,
    @Args('namaPanggilan', { nullable: true }) namaPanggilan?: string,
    @Args('nisn', { nullable: true }) nisn?: string,
    @Args('nik', { nullable: true }) nik?: string,
    @Args('tempatLahir', { nullable: true }) tempatLahir?: string,
    @Args('jenisKelamin', { nullable: true }) jenisKelamin?: string,
    @Args('agama', { nullable: true }) agama?: string,
    @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string,
    @Args('posisiId', { type: () => ID, nullable: true }) posisiId?: string,
    @Args('tinggiBadan', { type: () => Float, nullable: true }) tinggiBadan?: number,
    @Args('beratBadan', { type: () => Float, nullable: true }) beratBadan?: number,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('klubSebelumnya', { nullable: true }) klubSebelumnya?: string,
    @Args('provinsi', { nullable: true }) provinsi?: string,
    @Args('kabupaten', { nullable: true }) kabupaten?: string,
    @Args('kecamatan', { nullable: true }) kecamatan?: string,
    @Args('desa', { nullable: true }) desa?: string,
    @Args('alamatLengkap', { nullable: true }) alamatLengkap?: string,
    @Args('catatan', { nullable: true }) catatan?: string,
  ) {
    const slug = await this.siswaService.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { namaLengkap, tanggalLahir };
    for (const [k, v] of Object.entries({ namaPanggilan, nisn, nik, tempatLahir, jenisKelamin, agama, kelompokUmurId, posisiId, tinggiBadan, beratBadan, fotoUrl, status, klubSebelumnya, provinsi, kabupaten, kecamatan, desa, alamatLengkap, catatan })) {
      if (v !== undefined) data[k] = v;
    }
    return this.siswaService.create(slug, data);
  }

  @Mutation(() => Siswa, { name: 'updateSiswa' })
  @RequirePermissions('siswa.update')
  async updateSiswa(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('namaLengkap', { nullable: true }) namaLengkap?: string,
    @Args('namaPanggilan', { nullable: true }) namaPanggilan?: string,
    @Args('nisn', { nullable: true }) nisn?: string,
    @Args('nik', { nullable: true }) nik?: string,
    @Args('tempatLahir', { nullable: true }) tempatLahir?: string,
    @Args('tanggalLahir', { nullable: true }) tanggalLahir?: string,
    @Args('jenisKelamin', { nullable: true }) jenisKelamin?: string,
    @Args('agama', { nullable: true }) agama?: string,
    @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string,
    @Args('posisiId', { type: () => ID, nullable: true }) posisiId?: string,
    @Args('tinggiBadan', { type: () => Float, nullable: true }) tinggiBadan?: number,
    @Args('beratBadan', { type: () => Float, nullable: true }) beratBadan?: number,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('klubSebelumnya', { nullable: true }) klubSebelumnya?: string,
    @Args('provinsi', { nullable: true }) provinsi?: string,
    @Args('kabupaten', { nullable: true }) kabupaten?: string,
    @Args('kecamatan', { nullable: true }) kecamatan?: string,
    @Args('desa', { nullable: true }) desa?: string,
    @Args('alamatLengkap', { nullable: true }) alamatLengkap?: string,
    @Args('catatan', { nullable: true }) catatan?: string,
  ) {
    const slug = await this.siswaService.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    if (namaLengkap !== undefined) data.namaLengkap = namaLengkap;
    if (namaPanggilan !== undefined) data.namaPanggilan = namaPanggilan;
    if (nisn !== undefined) data.nisn = nisn;
    if (nik !== undefined) data.nik = nik;
    if (tempatLahir !== undefined) data.tempatLahir = tempatLahir;
    if (tanggalLahir !== undefined) data.tanggalLahir = tanggalLahir;
    if (jenisKelamin !== undefined) data.jenisKelamin = jenisKelamin;
    if (agama !== undefined) data.agama = agama;
    if (kelompokUmurId !== undefined) data.kelompokUmurId = kelompokUmurId;
    if (posisiId !== undefined) data.posisiId = posisiId;
    if (tinggiBadan !== undefined) data.tinggiBadan = tinggiBadan;
    if (beratBadan !== undefined) data.beratBadan = beratBadan;
    if (fotoUrl !== undefined) data.fotoUrl = fotoUrl;
    if (status !== undefined) data.status = status;
    if (klubSebelumnya !== undefined) data.klubSebelumnya = klubSebelumnya;
    if (provinsi !== undefined) data.provinsi = provinsi;
    if (kabupaten !== undefined) data.kabupaten = kabupaten;
    if (kecamatan !== undefined) data.kecamatan = kecamatan;
    if (desa !== undefined) data.desa = desa;
    if (alamatLengkap !== undefined) data.alamatLengkap = alamatLengkap;
    if (catatan !== undefined) data.catatan = catatan;
    return this.siswaService.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteSiswa' })
  @RequirePermissions('siswa.delete')
  async deleteSiswa(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.siswaService.resolveTenantSlug(userId);
    return this.siswaService.delete(slug, id);
  }
}
