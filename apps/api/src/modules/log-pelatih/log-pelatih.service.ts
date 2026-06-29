import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class LogPelatihService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  async findAll(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.logPelatih).orderBy(desc(t.logPelatih.tanggal));
  }

  async findByPelatih(slug: string, pelatihId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.logPelatih).where(eq(t.logPelatih.pelatihId, pelatihId)).orderBy(desc(t.logPelatih.tanggal));
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.logPelatih).values(data as any).returning();
    return r;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.logPelatih).where(eq(t.logPelatih.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Log tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['pelatihId', 'jadwalId', 'tanggal', 'kegiatan', 'materiId', 'catatan', 'durasiMenit']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.logPelatih).set(updateData).where(eq(t.logPelatih.id, id)).returning();
    return r;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.logPelatih).where(eq(t.logPelatih.id, id));
    return true;
  }
}
