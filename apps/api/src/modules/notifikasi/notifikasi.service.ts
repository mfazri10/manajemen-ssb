import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class NotifikasiService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  async findAll(slug: string, userId?: string) {
    const t = this.getTenant(slug);
    if (userId) {
      return this.dbService.db.select().from(t.notifikasi)
        .where(eq(t.notifikasi.penerimaUserId, userId))
        .orderBy(desc(t.notifikasi.createdAt));
    }
    return this.dbService.db.select().from(t.notifikasi).orderBy(desc(t.notifikasi.createdAt));
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.notifikasi).values(data as any).returning();
    return r;
  }

  async markAsRead(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.notifikasi).where(eq(t.notifikasi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Notifikasi tidak ditemukan.');
    const [r] = await this.dbService.db.update(t.notifikasi).set({ isRead: true }).where(eq(t.notifikasi.id, id)).returning();
    return r;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.notifikasi).where(eq(t.notifikasi.id, id));
    return true;
  }
}
