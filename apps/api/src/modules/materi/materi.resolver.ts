import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriKategori, MateriLatihan } from './entities/materi.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class MateriResolver {
  constructor(private readonly service: MateriService) {}

  // ========== KATEGORI ==========
  @Query(() => [MateriKategori], { name: 'materiKategori' })
  @RequirePermissions('siswa.index')
  async getKategori(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllKategori(slug);
  }

  @Mutation(() => MateriKategori, { name: 'createMateriKategori' })
  @RequirePermissions('siswa.create')
  async createKategori(@CurrentUser() userId: string, @Args('nama') nama: string, @Args('urutan', { type: () => Int, nullable: true }) urutan?: number) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { nama };
    if (urutan !== undefined) data.urutan = urutan;
    return this.service.createKategori(slug, data);
  }

  @Mutation(() => MateriKategori, { name: 'updateMateriKategori' })
  @RequirePermissions('siswa.update')
  async updateKategori(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('nama', { nullable: true }) nama?: string, @Args('urutan', { type: () => Int, nullable: true }) urutan?: number) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    if (nama !== undefined) data.nama = nama;
    if (urutan !== undefined) data.urutan = urutan;
    return this.service.updateKategori(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMateriKategori' })
  @RequirePermissions('siswa.delete')
  async deleteKategori(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteKategori(slug, id);
  }

  // ========== MATERI LATIHAN ==========
  @Query(() => [MateriLatihan], { name: 'materiLatihan' })
  @RequirePermissions('siswa.index')
  async getMateri(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllMateri(slug);
  }

  @Mutation(() => MateriLatihan, { name: 'createMateriLatihan' })
  @RequirePermissions('siswa.create')
  async createMateri(@CurrentUser() userId: string, @Args('judul') judul: string, @Args('kategoriId', { type: () => ID, nullable: true }) kategoriId?: string, @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string, @Args('deskripsi', { nullable: true }) deskripsi?: string, @Args('durasiMenit', { type: () => Int, nullable: true }) durasiMenit?: number, @Args('level', { nullable: true }) level?: string, @Args('tipe', { nullable: true }) tipe?: string, @Args('instruksi', { nullable: true }) instruksi?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { judul };
    for (const [k, v] of Object.entries({ kategoriId, kelompokUmurId, deskripsi, durasiMenit, level, tipe, instruksi })) { if (v !== undefined) data[k] = v; }
    return this.service.createMateri(slug, data);
  }

  @Mutation(() => MateriLatihan, { name: 'updateMateriLatihan' })
  @RequirePermissions('siswa.update')
  async updateMateri(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('judul', { nullable: true }) judul?: string, @Args('kategoriId', { type: () => ID, nullable: true }) kategoriId?: string, @Args('kelompokUmurId', { type: () => ID, nullable: true }) kelompokUmurId?: string, @Args('deskripsi', { nullable: true }) deskripsi?: string, @Args('durasiMenit', { type: () => Int, nullable: true }) durasiMenit?: number, @Args('level', { nullable: true }) level?: string, @Args('tipe', { nullable: true }) tipe?: string, @Args('instruksi', { nullable: true }) instruksi?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ judul, kategoriId, kelompokUmurId, deskripsi, durasiMenit, level, tipe, instruksi })) { if (v !== undefined) data[k] = v; }
    return this.service.updateMateri(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMateriLatihan' })
  @RequirePermissions('siswa.delete')
  async deleteMateri(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteMateri(slug, id);
  }
}
