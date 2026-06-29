import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class KeuanganEvaluasiService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db
      .select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  // ========== BUKU KAS ==========
  async findAllBukuKas(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.bukuKas).orderBy(desc(t.bukuKas.createdAt));
  }

  async createBukuKas(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.bukuKas).values(data as any).returning();
    return result;
  }

  async updateBukuKas(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.bukuKas).where(eq(t.bukuKas.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['tanggal', 'tipe', 'kategori', 'jumlah', 'keterangan']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.bukuKas).set(updateData).where(eq(t.bukuKas.id, id)).returning();
    return result;
  }

  async deleteBukuKas(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.bukuKas).where(eq(t.bukuKas.id, id));
    return true;
  }

  // ========== TABUNGAN ==========
  async findAllTabungan(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.tabungan).orderBy(desc(t.tabungan.createdAt));
  }

  async createTabungan(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.tabungan).values(data as any).returning();
    return result;
  }

  async deleteTabungan(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.tabungan).where(eq(t.tabungan.id, id));
    return true;
  }

  // ========== TES FISIK ==========
  async findAllTesFisik(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.tesFisik).orderBy(desc(t.tesFisik.createdAt));
  }

  async createTesFisik(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.tesFisik).values(data as any).returning();
    return result;
  }

  async updateTesFisik(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.tesFisik).where(eq(t.tesFisik.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['tanggal', 'jenisTes', 'nilai', 'satuan', 'catatan', 'kelompokUmurId']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.tesFisik).set(updateData).where(eq(t.tesFisik.id, id)).returning();
    return result;
  }

  async deleteTesFisik(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.tesFisik).where(eq(t.tesFisik.id, id));
    return true;
  }

  // ========== EVALUASI ==========
  async findAllEvaluasi(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.evaluasi).orderBy(desc(t.evaluasi.createdAt));
  }

  async createEvaluasi(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.evaluasi).values(data as any).returning();
    return result;
  }

  async updateEvaluasi(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.evaluasi).where(eq(t.evaluasi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['semester', 'tahunAjaran', 'teknik', 'fisik', 'taktik', 'mental', 'catatanPelatih', 'pelatihId']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.evaluasi).set(updateData).where(eq(t.evaluasi.id, id)).returning();
    return result;
  }

  async deleteEvaluasi(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.evaluasi).where(eq(t.evaluasi.id, id));
    return true;
  }

  // ========== PELANGGARAN SISWA ==========
  async findAllPelanggaran(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.pelanggaran).orderBy(desc(t.pelanggaran.createdAt));
  }

  async createPelanggaran(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.pelanggaran).values(data as any).returning();
    return result;
  }

  async deletePelanggaran(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.pelanggaran).where(eq(t.pelanggaran.id, id));
    return true;
  }
}
