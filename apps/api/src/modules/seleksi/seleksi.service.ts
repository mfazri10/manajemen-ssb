import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class SeleksiService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  // ========== SELEKSI ==========
  async findAll(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.seleksi).orderBy(desc(t.seleksi.createdAt));
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.seleksi).values(data as any).returning();
    return r;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.seleksi).where(eq(t.seleksi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Seleksi tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['nama', 'tanggal', 'lokasi', 'keterangan']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.seleksi).set(updateData).where(eq(t.seleksi.id, id)).returning();
    return r;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.seleksi).where(eq(t.seleksi.id, id));
    return true;
  }

  // ========== PESERTA ==========
  async findPeserta(slug: string, seleksiId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.seleksiPeserta).where(eq(t.seleksiPeserta.seleksiId, seleksiId));
  }

  async createPeserta(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.seleksiPeserta).values(data as any).returning();
    return r;
  }

  async updatePeserta(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.seleksiPeserta).where(eq(t.seleksiPeserta.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Peserta tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['status', 'nilai', 'catatan']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.seleksiPeserta).set(updateData).where(eq(t.seleksiPeserta.id, id)).returning();
    return r;
  }

  async deletePeserta(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.seleksiPeserta).where(eq(t.seleksiPeserta.id, id));
    return true;
  }
}
