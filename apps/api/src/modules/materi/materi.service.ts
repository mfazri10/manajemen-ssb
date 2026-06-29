import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class MateriService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  // ========== KATEGORI ==========
  async findAllKategori(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.materiKategori).orderBy(t.materiKategori.urutan);
  }

  async createKategori(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.materiKategori).values(data as any).returning();
    return r;
  }

  async updateKategori(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.materiKategori).where(eq(t.materiKategori.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Kategori tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['nama', 'urutan']) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.materiKategori).set(updateData).where(eq(t.materiKategori.id, id)).returning();
    return r;
  }

  async deleteKategori(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.materiKategori).where(eq(t.materiKategori.id, id));
    return true;
  }

  // ========== MATERI LATIHAN ==========
  async findAllMateri(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.materiLatihan).orderBy(desc(t.materiLatihan.createdAt));
  }

  async createMateri(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.materiLatihan).values(data as any).returning();
    return r;
  }

  async updateMateri(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.materiLatihan).where(eq(t.materiLatihan.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Materi tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['kategoriId', 'kelompokUmurId', 'judul', 'deskripsi', 'durasiMenit', 'level', 'tipe', 'instruksi']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.materiLatihan).set(updateData).where(eq(t.materiLatihan.id, id)).returning();
    return r;
  }

  async deleteMateri(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.materiLatihan).where(eq(t.materiLatihan.id, id));
    return true;
  }
}
