import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class Fase34Service {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  // ========== PENGUMUMAN ==========
  async findAllPengumuman(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.pengumuman).orderBy(desc(t.pengumuman.createdAt));
  }
  async createPengumuman(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.pengumuman).values(data as any).returning();
    return r;
  }
  async updatePengumuman(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.pengumuman).where(eq(t.pengumuman.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['judul', 'isi', 'target', 'kelompokUmurId', 'tanggal']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.pengumuman).set(updateData).where(eq(t.pengumuman.id, id)).returning();
    return r;
  }
  async deletePengumuman(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.pengumuman).where(eq(t.pengumuman.id, id));
    return true;
  }

  // ========== TURNAMEN ==========
  async findAllTurnamen(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.turnamen).orderBy(desc(t.turnamen.createdAt));
  }
  async createTurnamen(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.turnamen).values(data as any).returning();
    return r;
  }
  async updateTurnamen(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.turnamen).where(eq(t.turnamen.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['nama', 'tanggalMulai', 'tanggalSelesai', 'lokasi', 'kategoriUmur', 'hasil']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.turnamen).set(updateData).where(eq(t.turnamen.id, id)).returning();
    return r;
  }
  async deleteTurnamen(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.turnamen).where(eq(t.turnamen.id, id));
    return true;
  }

  // ========== TURNAMEN PESERTA ==========
  async findPesertaByTurnamen(slug: string, turnamenId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.turnamenPeserta).where(eq(t.turnamenPeserta.turnamenId, turnamenId));
  }
  async createPeserta(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.turnamenPeserta).values(data as any).returning();
    return r;
  }
  async deletePeserta(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.turnamenPeserta).where(eq(t.turnamenPeserta.id, id));
    return true;
  }

  // ========== INVENTARIS ==========
  async findAllInventaris(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.inventaris).orderBy(desc(t.inventaris.createdAt));
  }
  async createInventaris(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.inventaris).values(data as any).returning();
    return r;
  }
  async updateInventaris(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.inventaris).where(eq(t.inventaris.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['nama', 'kategori', 'jumlah', 'satuan', 'kondisi', 'keterangan']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.inventaris).set(updateData).where(eq(t.inventaris.id, id)).returning();
    return r;
  }
  async deleteInventaris(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.inventaris).where(eq(t.inventaris.id, id));
    return true;
  }

  // ========== INVENTARIS DISTRIBUSI ==========
  async findAllDistribusi(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.inventarisDistribusi).orderBy(desc(t.inventarisDistribusi.createdAt));
  }
  async createDistribusi(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.inventarisDistribusi).values(data as any).returning();
    return r;
  }
  async updateDistribusi(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.inventarisDistribusi).where(eq(t.inventarisDistribusi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data distribusi tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['inventarisId', 'siswaId', 'jumlah', 'tanggal', 'status', 'keterangan']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.inventarisDistribusi).set(updateData).where(eq(t.inventarisDistribusi.id, id)).returning();
    return r;
  }
  async deleteDistribusi(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.inventarisDistribusi).where(eq(t.inventarisDistribusi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data distribusi tidak ditemukan.');
    await this.dbService.db.delete(t.inventarisDistribusi).where(eq(t.inventarisDistribusi.id, id));
    return true;
  }

  // ========== INVENTARIS MUTASI ==========
  async findAllMutasi(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.inventarisMutasi).orderBy(desc(t.inventarisMutasi.createdAt));
  }
  async createMutasi(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.inventarisMutasi).values(data as any).returning();
    return r;
  }
  async deleteMutasi(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.inventarisMutasi).where(eq(t.inventarisMutasi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data mutasi tidak ditemukan.');
    await this.dbService.db.delete(t.inventarisMutasi).where(eq(t.inventarisMutasi.id, id));
    return true;
  }
}
