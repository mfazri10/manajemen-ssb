import { Injectable, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class AuditLogService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) {
    return getTenantSchema(slug);
  }

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

  async findAll(slug: string, akademiId: string, entitas?: string, limit = 50) {
    const t = this.getTenant(slug);
    const whereClause = entitas
      ? and(eq(t.auditLog.akademiId, akademiId), eq(t.auditLog.entitas, entitas))
      : eq(t.auditLog.akademiId, akademiId);
    return this.dbService.db.select().from(t.auditLog)
      .where(whereClause)
      .orderBy(desc(t.auditLog.createdAt))
      .limit(limit);
  }

  async findRecentActivity(slug: string, akademiId: string, limit = 20) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.auditLog)
      .where(eq(t.auditLog.akademiId, akademiId))
      .orderBy(desc(t.auditLog.createdAt))
      .limit(limit);
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const insertData: Record<string, unknown> = {
      akademiId: data.akademiId,
      aksi: data.aksi,
    };
    if (data.userId !== undefined) insertData.userId = data.userId;
    if (data.entitas !== undefined) insertData.entitas = data.entitas;
    if (data.entitasId !== undefined) insertData.entitasId = data.entitasId;
    if (data.dataLama !== undefined) insertData.dataLama = typeof data.dataLama === 'object' ? JSON.stringify(data.dataLama) : data.dataLama;
    if (data.dataBaru !== undefined) insertData.dataBaru = typeof data.dataBaru === 'object' ? JSON.stringify(data.dataBaru) : data.dataBaru;
    if (data.ipAddress !== undefined) insertData.ipAddress = data.ipAddress;

    const [result] = await this.dbService.db.insert(t.auditLog).values(insertData as any).returning();
    return result;
  }
}
