import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class OrangTuaService {
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
    return this.dbService.db.select().from(t.orangTua).orderBy(desc(t.orangTua.createdAt));
  }

  async findBySiswaId(slug: string, siswaId: string) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db
      .select().from(t.orangTua).where(eq(t.orangTua.siswaId, siswaId)).limit(1);
    return result || null;
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const insertData: Record<string, unknown> = {
      siswaId: data.siswaId,
      namaOrangTua: data.namaOrangTua,
      hpOrangTua: data.hpOrangTua,
    };
    if (data.hpAyah !== undefined) insertData.hpAyah = data.hpAyah;
    if (data.hpIbu !== undefined) insertData.hpIbu = data.hpIbu;
    if (data.email !== undefined) insertData.email = data.email;
    if (data.hubungan !== undefined) insertData.hubungan = data.hubungan;

    const [result] = await this.dbService.db.insert(t.orangTua).values(insertData as any).returning();
    return result;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.orangTua).where(eq(t.orangTua.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data orang tua tidak ditemukan.');

    const updateData: Record<string, unknown> = {};
    for (const key of ['namaOrangTua', 'hpOrangTua', 'hpAyah', 'hpIbu', 'email', 'hubungan']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    if (Object.keys(updateData).length === 0) throw new BadRequestException('Tidak ada data yang diubah.');

    const [result] = await this.dbService.db.update(t.orangTua).set(updateData).where(eq(t.orangTua.id, id)).returning();
    return result;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.orangTua).where(eq(t.orangTua.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Data orang tua tidak ditemukan.');
    await this.dbService.db.delete(t.orangTua).where(eq(t.orangTua.id, id));
    return true;
  }
}
