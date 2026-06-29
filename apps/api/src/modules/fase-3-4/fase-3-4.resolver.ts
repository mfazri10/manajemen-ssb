import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Fase34Service } from './fase-3-4.service';
import { Pengumuman, Turnamen, TurnamenPeserta, Inventaris } from './entities/fase-3-4.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class Fase34Resolver {
  constructor(private readonly service: Fase34Service) {}

  // ========== PENGUMUMAN ==========
  @Query(() => [Pengumuman], { name: 'pengumuman' })
  @RequirePermissions('pengumuman.index')
  async getPengumuman(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllPengumuman(slug);
  }

  @Mutation(() => Pengumuman, { name: 'createPengumuman' })
  @RequirePermissions('pengumuman.create')
  async createPengumuman(@CurrentUser() userId: string, @Args('judul') judul: string, @Args('isi') isi: string, @Args('target', { nullable: true }) target?: string, @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string, @Args('tanggal', { nullable: true }) tanggal?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { judul, isi };
    if (target !== undefined) data.target = target;
    if (kelompokUmurId !== undefined) data.kelompokUmurId = kelompokUmurId;
    if (tanggal !== undefined) data.tanggal = tanggal;
    return this.service.createPengumuman(slug, data);
  }

  @Mutation(() => Pengumuman, { name: 'updatePengumuman' })
  @RequirePermissions('pengumuman.update')
  async updatePengumuman(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('judul', { nullable: true }) judul?: string, @Args('isi', { nullable: true }) isi?: string, @Args('target', { nullable: true }) target?: string, @Args('tanggal', { nullable: true }) tanggal?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ judul, isi, target, tanggal })) { if (v !== undefined) data[k] = v; }
    return this.service.updatePengumuman(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deletePengumuman' })
  @RequirePermissions('pengumuman.delete')
  async deletePengumuman(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deletePengumuman(slug, id);
  }

  // ========== TURNAMEN ==========
  @Query(() => [Turnamen], { name: 'turnamen' })
  @RequirePermissions('turnamen.index')
  async getTurnamen(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllTurnamen(slug);
  }

  @Mutation(() => Turnamen, { name: 'createTurnamen' })
  @RequirePermissions('turnamen.create')
  async createTurnamen(@CurrentUser() userId: string, @Args('nama') nama: string, @Args('tanggalMulai', { nullable: true }) tanggalMulai?: string, @Args('tanggalSelesai', { nullable: true }) tanggalSelesai?: string, @Args('lokasi', { nullable: true }) lokasi?: string, @Args('kategoriUmur', { nullable: true }) kategoriUmur?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { nama };
    for (const [k, v] of Object.entries({ tanggalMulai, tanggalSelesai, lokasi, kategoriUmur })) { if (v !== undefined) data[k] = v; }
    return this.service.createTurnamen(slug, data);
  }

  @Mutation(() => Turnamen, { name: 'updateTurnamen' })
  @RequirePermissions('turnamen.update')
  async updateTurnamen(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('nama', { nullable: true }) nama?: string, @Args('tanggalMulai', { nullable: true }) tanggalMulai?: string, @Args('tanggalSelesai', { nullable: true }) tanggalSelesai?: string, @Args('lokasi', { nullable: true }) lokasi?: string, @Args('kategoriUmur', { nullable: true }) kategoriUmur?: string, @Args('hasil', { nullable: true }) hasil?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ nama, tanggalMulai, tanggalSelesai, lokasi, kategoriUmur, hasil })) { if (v !== undefined) data[k] = v; }
    return this.service.updateTurnamen(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteTurnamen' })
  @RequirePermissions('turnamen.delete')
  async deleteTurnamen(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteTurnamen(slug, id);
  }

  // ========== TURNAMEN PESERTA ==========
  @Query(() => [TurnamenPeserta], { name: 'turnamenPeserta' })
  @RequirePermissions('turnamen.index')
  async getPeserta(@CurrentUser() userId: string, @Args('turnamenId', { type: () => ID }) turnamenId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findPesertaByTurnamen(slug, turnamenId);
  }

  @Mutation(() => TurnamenPeserta, { name: 'createTurnamenPeserta' })
  @RequirePermissions('turnamen.create')
  async createPeserta(@CurrentUser() userId: string, @Args('turnamenId', { type: () => ID }) turnamenId: string, @Args('siswaId', { type: () => ID }) siswaId: string, @Args('posisi', { nullable: true }) posisi?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { turnamenId, siswaId };
    if (posisi !== undefined) data.posisi = posisi;
    return this.service.createPeserta(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deleteTurnamenPeserta' })
  @RequirePermissions('turnamen.delete')
  async deletePeserta(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deletePeserta(slug, id);
  }

  // ========== INVENTARIS ==========
  @Query(() => [Inventaris], { name: 'inventaris' })
  @RequirePermissions('inventaris.index')
  async getInventaris(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllInventaris(slug);
  }

  @Mutation(() => Inventaris, { name: 'createInventaris' })
  @RequirePermissions('inventaris.create')
  async createInventaris(@CurrentUser() userId: string, @Args('nama') nama: string, @Args('kategori', { nullable: true }) kategori?: string, @Args('jumlah', { type: () => Int, nullable: true }) jumlah?: number, @Args('satuan', { nullable: true }) satuan?: string, @Args('kondisi', { nullable: true }) kondisi?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { nama };
    for (const [k, v] of Object.entries({ kategori, jumlah, satuan, kondisi, keterangan })) { if (v !== undefined) data[k] = v; }
    return this.service.createInventaris(slug, data);
  }

  @Mutation(() => Inventaris, { name: 'updateInventaris' })
  @RequirePermissions('inventaris.update')
  async updateInventaris(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('nama', { nullable: true }) nama?: string, @Args('kategori', { nullable: true }) kategori?: string, @Args('jumlah', { type: () => Int, nullable: true }) jumlah?: number, @Args('satuan', { nullable: true }) satuan?: string, @Args('kondisi', { nullable: true }) kondisi?: string, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ nama, kategori, jumlah, satuan, kondisi, keterangan })) { if (v !== undefined) data[k] = v; }
    return this.service.updateInventaris(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteInventaris' })
  @RequirePermissions('inventaris.delete')
  async deleteInventaris(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteInventaris(slug, id);
  }
}
