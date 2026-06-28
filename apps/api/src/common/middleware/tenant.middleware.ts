import { Injectable, NestMiddleware } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { akademi, userAkademis } from '@workspace/db';
import { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private dbService: DrizzleService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const db = this.dbService.db;
    
    // 1. Ambil user dari session (sudah di-set oleh auth middleware)
    const userId = (req as any).user?.id;
    if (!userId) return next();

    // 2. Cari akademi default user
    const [userAkademi] = await db
      .select({
        akademiId: userAkademis.akademiId,
        slug: akademi.slug,
        nama: akademi.nama
      })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);

    if (!userAkademi) {
      return next();
    }

    // 3. Simpan tenant context di request
    const schemaName = `tenant_${userAkademi.slug}`;
    (req as any).tenantSlug = userAkademi.slug;
    (req as any).tenantSchema = schemaName;
    (req as any).akademiId = userAkademi.akademiId;

    next();
  }
}
