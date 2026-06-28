import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { KelompokUmur, MasterPosisi, MasterPelanggaran } from './entities/master-data.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class MasterDataResolver {
  constructor(private readonly masterDataService: MasterDataService) {}

  // ========================
  // KELOMPOK UMUR
  // ========================
  @Query(() => [KelompokUmur], { name: 'kelompokUmur' })
  @RequirePermissions('kelompok-umur.index')
  async getKelompokUmur(@CurrentUser() userId: string) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.findAllKelompokUmur(slug);
  }

  @Mutation(() => KelompokUmur, { name: 'createKelompokUmur' })
  @RequirePermissions('kelompok-umur.create')
  async createKelompokUmur(
    @CurrentUser() userId: string,
    @Args('nama') nama: string,
    @Args('usiaMin', { type: () => Number, nullable: true }) usiaMin?: number,
    @Args('usiaMax', { type: () => Number, nullable: true }) usiaMax?: number,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    const data: { nama: string; usiaMin?: number; usiaMax?: number } = { nama };
    if (usiaMin !== undefined) data.usiaMin = usiaMin;
    if (usiaMax !== undefined) data.usiaMax = usiaMax;
    return this.masterDataService.createKelompokUmur(slug, data);
  }

  @Mutation(() => KelompokUmur, { name: 'updateKelompokUmur' })
  @RequirePermissions('kelompok-umur.update')
  async updateKelompokUmur(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('nama', { nullable: true }) nama?: string,
    @Args('usiaMin', { type: () => Number, nullable: true }) usiaMin?: number,
    @Args('usiaMax', { type: () => Number, nullable: true }) usiaMax?: number,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    const data: { nama?: string; usiaMin?: number; usiaMax?: number } = {};
    if (nama !== undefined) data.nama = nama;
    if (usiaMin !== undefined) data.usiaMin = usiaMin;
    if (usiaMax !== undefined) data.usiaMax = usiaMax;
    return this.masterDataService.updateKelompokUmur(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteKelompokUmur' })
  @RequirePermissions('kelompok-umur.delete')
  async deleteKelompokUmur(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.deleteKelompokUmur(slug, id);
  }

  // ========================
  // MASTER POSISI
  // ========================
  @Query(() => [MasterPosisi], { name: 'masterPosisi' })
  @RequirePermissions('master-posisi.index')
  async getMasterPosisi(@CurrentUser() userId: string) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.findAllMasterPosisi(slug);
  }

  @Mutation(() => MasterPosisi, { name: 'createMasterPosisi' })
  @RequirePermissions('master-posisi.create')
  async createMasterPosisi(
    @CurrentUser() userId: string,
    @Args('kode') kode: string,
    @Args('nama') nama: string,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.createMasterPosisi(slug, { kode, nama });
  }

  @Mutation(() => MasterPosisi, { name: 'updateMasterPosisi' })
  @RequirePermissions('master-posisi.update')
  async updateMasterPosisi(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('kode', { nullable: true }) kode?: string,
    @Args('nama', { nullable: true }) nama?: string,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    const data: { kode?: string; nama?: string } = {};
    if (kode !== undefined) data.kode = kode;
    if (nama !== undefined) data.nama = nama;
    return this.masterDataService.updateMasterPosisi(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMasterPosisi' })
  @RequirePermissions('master-posisi.delete')
  async deleteMasterPosisi(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.deleteMasterPosisi(slug, id);
  }

  // ========================
  // MASTER PELANGGARAN
  // ========================
  @Query(() => [MasterPelanggaran], { name: 'masterPelanggaran' })
  @RequirePermissions('master-pelanggaran.index')
  async getMasterPelanggaran(@CurrentUser() userId: string) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.findAllMasterPelanggaran(slug);
  }

  @Mutation(() => MasterPelanggaran, { name: 'createMasterPelanggaran' })
  @RequirePermissions('master-pelanggaran.create')
  async createMasterPelanggaran(
    @CurrentUser() userId: string,
    @Args('nama') nama: string,
    @Args('poin', { type: () => Number, nullable: true }) poin?: number,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    const data: { nama: string; poin?: number } = { nama };
    if (poin !== undefined) data.poin = poin;
    return this.masterDataService.createMasterPelanggaran(slug, data);
  }

  @Mutation(() => MasterPelanggaran, { name: 'updateMasterPelanggaran' })
  @RequirePermissions('master-pelanggaran.update')
  async updateMasterPelanggaran(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('nama', { nullable: true }) nama?: string,
    @Args('poin', { type: () => Number, nullable: true }) poin?: number,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    const data: { nama?: string; poin?: number } = {};
    if (nama !== undefined) data.nama = nama;
    if (poin !== undefined) data.poin = poin;
    return this.masterDataService.updateMasterPelanggaran(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMasterPelanggaran' })
  @RequirePermissions('master-pelanggaran.delete')
  async deleteMasterPelanggaran(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.masterDataService.resolveTenantSlug(userId);
    return this.masterDataService.deleteMasterPelanggaran(slug, id);
  }
}
