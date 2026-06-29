import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { KeuanganEvaluasiService } from './keuangan-evaluasi.service';
import { BukuKas, Tabungan, TesFisik, Evaluasi, PelanggaranSiswa } from './entities/keuangan-evaluasi.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class KeuanganEvaluasiResolver {
  constructor(private readonly service: KeuanganEvaluasiService) {}

  // ========== BUKU KAS ==========
  @Query(() => [BukuKas], { name: 'bukuKas' })
  @RequirePermissions('buku-kas.index')
  async getBukuKas(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllBukuKas(slug);
  }

  @Mutation(() => BukuKas, { name: 'createBukuKas' })
  @RequirePermissions('buku-kas.create')
  async createBukuKas(@CurrentUser() userId: string, @Args('tanggal') tanggal: string, @Args('tipe') tipe: string, @Args('jumlah', { type: () => Float }) jumlah: number, @Args('kategori', { nullable: true }) kategori?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { tanggal, tipe, jumlah };
    if (kategori !== undefined) data.kategori = kategori;
    if (keterangan !== undefined) data.keterangan = keterangan;
    return this.service.createBukuKas(slug, data);
  }

  @Mutation(() => BukuKas, { name: 'updateBukuKas' })
  @RequirePermissions('buku-kas.update')
  async updateBukuKas(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('tanggal', { nullable: true }) tanggal?: string, @Args('tipe', { nullable: true }) tipe?: string, @Args('jumlah', { type: () => Float, nullable: true }) jumlah?: number, @Args('kategori', { nullable: true }) kategori?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ tanggal, tipe, jumlah, kategori, keterangan })) { if (v !== undefined) data[k] = v; }
    return this.service.updateBukuKas(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteBukuKas' })
  @RequirePermissions('buku-kas.delete')
  async deleteBukuKas(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteBukuKas(slug, id);
  }

  // ========== TABUNGAN ==========
  @Query(() => [Tabungan], { name: 'tabungan' })
  @RequirePermissions('tabungan.index')
  async getTabungan(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllTabungan(slug);
  }

  @Mutation(() => Tabungan, { name: 'createTabungan' })
  @RequirePermissions('tabungan.create')
  async createTabungan(@CurrentUser() userId: string, @Args('siswaId', { type: () => ID }) siswaId: string, @Args('tanggal') tanggal: string, @Args('tipe') tipe: string, @Args('jumlah', { type: () => Float }) jumlah: number, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, tanggal, tipe, jumlah };
    if (keterangan !== undefined) data.keterangan = keterangan;
    return this.service.createTabungan(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deleteTabungan' })
  @RequirePermissions('tabungan.delete')
  async deleteTabungan(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteTabungan(slug, id);
  }

  // ========== TES FISIK ==========
  @Query(() => [TesFisik], { name: 'tesFisik' })
  @RequirePermissions('tes-fisik.index')
  async getTesFisik(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllTesFisik(slug);
  }

  @Mutation(() => TesFisik, { name: 'createTesFisik' })
  @RequirePermissions('tes-fisik.create')
  async createTesFisik(@CurrentUser() userId: string, @Args('siswaId', { type: () => ID }) siswaId: string, @Args('tanggal') tanggal: string, @Args('jenisTes') jenisTes: string, @Args('nilai', { type: () => Float }) nilai: number, @Args('satuan', { nullable: true }) satuan?: string, @Args('catatan', { nullable: true }) catatan?: string, @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, tanggal, jenisTes, nilai };
    if (satuan !== undefined) data.satuan = satuan;
    if (catatan !== undefined) data.catatan = catatan;
    if (kelompokUmurId !== undefined) data.kelompokUmurId = kelompokUmurId;
    return this.service.createTesFisik(slug, data);
  }

  @Mutation(() => TesFisik, { name: 'updateTesFisik' })
  @RequirePermissions('tes-fisik.update')
  async updateTesFisik(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('tanggal', { nullable: true }) tanggal?: string, @Args('jenisTes', { nullable: true }) jenisTes?: string, @Args('nilai', { type: () => Float, nullable: true }) nilai?: number, @Args('satuan', { nullable: true }) satuan?: string, @Args('catatan', { nullable: true }) catatan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ tanggal, jenisTes, nilai, satuan, catatan })) { if (v !== undefined) data[k] = v; }
    return this.service.updateTesFisik(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteTesFisik' })
  @RequirePermissions('tes-fisik.delete')
  async deleteTesFisik(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteTesFisik(slug, id);
  }

  // ========== EVALUASI ==========
  @Query(() => [Evaluasi], { name: 'evaluasi' })
  @RequirePermissions('evaluasi.index')
  async getEvaluasi(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllEvaluasi(slug);
  }

  @Mutation(() => Evaluasi, { name: 'createEvaluasi' })
  @RequirePermissions('evaluasi.create')
  async createEvaluasi(@CurrentUser() userId: string, @Args('siswaId', { type: () => ID }) siswaId: string, @Args('semester') semester: string, @Args('tahunAjaran') tahunAjaran: string, @Args('pelatihId', { type: () => ID, nullable: true }) pelatihId?: string, @Args('teknik', { type: () => Number, nullable: true }) teknik?: number, @Args('fisik', { type: () => Number, nullable: true }) fisik?: number, @Args('taktik', { type: () => Number, nullable: true }) taktik?: number, @Args('mental', { type: () => Number, nullable: true }) mental?: number, @Args('catatanPelatih', { nullable: true }) catatanPelatih?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, semester, tahunAjaran };
    for (const [k, v] of Object.entries({ pelatihId, teknik, fisik, taktik, mental, catatanPelatih })) { if (v !== undefined) data[k] = v; }
    return this.service.createEvaluasi(slug, data);
  }

  @Mutation(() => Evaluasi, { name: 'updateEvaluasi' })
  @RequirePermissions('evaluasi.update')
  async updateEvaluasi(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('semester', { nullable: true }) semester?: string, @Args('tahunAjaran', { nullable: true }) tahunAjaran?: string, @Args('teknik', { type: () => Number, nullable: true }) teknik?: number, @Args('fisik', { type: () => Number, nullable: true }) fisik?: number, @Args('taktik', { type: () => Number, nullable: true }) taktik?: number, @Args('mental', { type: () => Number, nullable: true }) mental?: number, @Args('catatanPelatih', { nullable: true }) catatanPelatih?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ semester, tahunAjaran, teknik, fisik, taktik, mental, catatanPelatih })) { if (v !== undefined) data[k] = v; }
    return this.service.updateEvaluasi(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteEvaluasi' })
  @RequirePermissions('evaluasi.delete')
  async deleteEvaluasi(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteEvaluasi(slug, id);
  }

  // ========== PELANGGARAN SISWA ==========
  @Query(() => [PelanggaranSiswa], { name: 'pelanggaranSiswa' })
  @RequirePermissions('pelanggaran-siswa.index')
  async getPelanggaran(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllPelanggaran(slug);
  }

  @Mutation(() => PelanggaranSiswa, { name: 'createPelanggaranSiswa' })
  @RequirePermissions('pelanggaran-siswa.create')
  async createPelanggaran(@CurrentUser() userId: string, @Args('siswaId', { type: () => ID }) siswaId: string, @Args('tanggal') tanggal: string, @Args('masterPelanggaranId', { type: () => ID, nullable: true }) masterPelanggaranId?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, tanggal };
    if (masterPelanggaranId !== undefined) data.masterPelanggaranId = masterPelanggaranId;
    if (keterangan !== undefined) data.keterangan = keterangan;
    return this.service.createPelanggaran(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deletePelanggaranSiswa' })
  @RequirePermissions('pelanggaran-siswa.delete')
  async deletePelanggaran(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deletePelanggaran(slug, id);
  }
}
