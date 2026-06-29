import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class SppService {
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

  // === TAGIHAN ===
  async findAllTagihan(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.sppTagihan).orderBy(desc(t.sppTagihan.createdAt));
  }

  async findTagihanBySiswa(slug: string, siswaId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.sppTagihan).where(eq(t.sppTagihan.siswaId, siswaId));
  }

  async createTagihan(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.sppTagihan).values(data as any).returning();
    return result;
  }

  async updateTagihan(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.sppTagihan).where(eq(t.sppTagihan.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Tagihan tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['jumlah', 'status', 'jatuhTempo', 'bulan', 'tahun']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.sppTagihan).set(updateData).where(eq(t.sppTagihan.id, id)).returning();
    return result;
  }

  async deleteTagihan(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.sppTagihan).where(eq(t.sppTagihan.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Tagihan tidak ditemukan.');
    await this.dbService.db.delete(t.sppTagihan).where(eq(t.sppTagihan.id, id));
    return true;
  }

  // === PEMBAYARAN ===
  async findPembayaranByTagihan(slug: string, tagihanId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.sppPembayaran).where(eq(t.sppPembayaran.tagihanId, tagihanId));
  }

  async createPembayaran(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.sppPembayaran).values(data as any).returning();
    // Update tagihan status if fully paid
    if (data.tagihanId) {
      const tagihan = await this.dbService.db.select().from(t.sppTagihan).where(eq(t.sppTagihan.id, data.tagihanId as string)).limit(1);
      if (tagihan.length) {
        const allPembayaran = await this.dbService.db.select().from(t.sppPembayaran).where(eq(t.sppPembayaran.tagihanId, data.tagihanId as string));
        const totalBayar = allPembayaran.reduce((sum, p) => sum + Number(p.jumlah), 0);
        if (tagihan.length && tagihan[0] && totalBayar >= Number(tagihan[0].jumlah)) {
          await this.dbService.db.update(t.sppTagihan).set({ status: 'lunas' }).where(eq(t.sppTagihan.id, data.tagihanId as string));
        }
      }
    }
    return result;
  }

  async deletePembayaran(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.sppPembayaran).where(eq(t.sppPembayaran.id, id));
    return true;
  }
}
