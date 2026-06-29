import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class JadwalService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db
      .select({ slug: akademi.slug })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  async findAll(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.jadwalLatihan).orderBy(desc(t.jadwalLatihan.createdAt));
  }

  async findById(slug: string, id: string) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.select().from(t.jadwalLatihan).where(eq(t.jadwalLatihan.id, id)).limit(1);
    if (!r) throw new NotFoundException('Jadwal tidak ditemukan.');
    return r;
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.jadwalLatihan).values(data as any).returning();
    return result;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);
    const allowed = ['kelompokUmurId', 'hari', 'waktuMulai', 'waktuSelesai', 'lokasi', 'materi', 'tanggal', 'status'];
    const updateData: Record<string, unknown> = {};
    for (const k of allowed) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (Object.keys(updateData).length === 0) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.jadwalLatihan).set(updateData).where(eq(t.jadwalLatihan.id, id)).returning();
    return result;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);
    await this.dbService.db.delete(t.jadwalLatihan).where(eq(t.jadwalLatihan.id, id));
    return true;
  }
}
