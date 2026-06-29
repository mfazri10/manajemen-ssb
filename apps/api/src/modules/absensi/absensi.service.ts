import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class AbsensiService {
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
    return this.dbService.db.select().from(t.absensi).orderBy(desc(t.absensi.createdAt));
  }

  async findByJadwal(slug: string, jadwalId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.absensi).where(eq(t.absensi.jadwalId, jadwalId));
  }

  async findBySiswa(slug: string, siswaId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.absensi).where(eq(t.absensi.siswaId, siswaId));
  }

  async create(slug: string, data: { jadwalId: string; siswaId: string; tanggal: string; status: string; keterangan?: string }) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.absensi).values({
      jadwalId: data.jadwalId, siswaId: data.siswaId, tanggal: data.tanggal, status: data.status,
      ...(data.keterangan !== undefined && { keterangan: data.keterangan }),
    }).returning();
    return result;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.absensi).where(eq(t.absensi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data absensi tidak ditemukan.');

    const updateData: Record<string, unknown> = {};
    for (const k of ['status', 'keterangan', 'tanggal']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (Object.keys(updateData).length === 0) throw new BadRequestException('Tidak ada data yang diubah.');

    const [result] = await this.dbService.db.update(t.absensi).set(updateData).where(eq(t.absensi.id, id)).returning();
    return result;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.absensi).where(eq(t.absensi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data absensi tidak ditemukan.');
    await this.dbService.db.delete(t.absensi).where(eq(t.absensi.id, id));
    return true;
  }
}
