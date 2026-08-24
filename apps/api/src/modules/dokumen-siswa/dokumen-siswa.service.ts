import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class DokumenSiswaService {
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
    return this.dbService.db.select().from(t.dokumenSiswa).orderBy(desc(t.dokumenSiswa.uploadedAt));
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.dokumenSiswa).values(data as any).returning();
    return r;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.dokumenSiswa).where(eq(t.dokumenSiswa.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Dokumen tidak ditemukan.');
    await this.dbService.db.delete(t.dokumenSiswa).where(eq(t.dokumenSiswa.id, id));
    return true;
  }
}
