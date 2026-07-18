import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly dbService: DrizzleService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Audit log hanya mencatat aktivitas dari request GraphQL
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    
    // Pastikan ini adalah operasi GraphQL Mutation (Write)
    if (info && info.parentType && info.parentType.name === 'Mutation') {
      const req = ctx.getContext().req;
      const userId = req?.userId;
      
      if (userId) {
        return next.handle().pipe(
          tap(async (result) => {
            try {
              // Resolving slug & akademiId milik user secara transaksional
              const [ua] = await this.dbService.db
                .select({ slug: akademi.slug, id: akademi.id })
                .from(userAkademis)
                .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
                .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
                .limit(1);

              if (ua) {
                const args = ctx.getArgs();
                const fieldName = info.fieldName; // e.g. 'createSiswa'
                const ipAddress = req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress;
                
                // Ekstraksi entitas dari nama mutasi (misal: 'createSiswa' -> 'siswa')
                const entitas = fieldName
                  .replace(/create|update|delete/gi, '')
                  .toLowerCase();

                // Identifikasi ID entitas dari argumen mutasi
                const entitasId = args.id || args.siswaId || args.tagihanId || (result && result.id) || null;

                // Log data lama / baru
                const dataBaru = { ...args };
                // Hilangkan password jika ada argumen sensitif
                if (dataBaru.password) delete dataBaru.password;

                await this.auditLogService.create(ua.slug, {
                  akademiId: ua.id,
                  userId,
                  aksi: fieldName,
                  entitas,
                  entitasId,
                  dataBaru,
                  ipAddress,
                });
              }
            } catch (err) {
              console.error('[Audit Log Error]: Gagal mencatat log aktivitas:', err);
            }
          }),
        );
      }
    }

    return next.handle();
  }
}
