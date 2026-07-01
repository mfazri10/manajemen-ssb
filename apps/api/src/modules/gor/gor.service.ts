import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc, like, sql } from 'drizzle-orm';

export interface CreateGorInput {
  nama: string;
  alamat?: string;
  kota?: string;
  telepon?: string;
  deskripsi?: string;
  fotoUrl?: string;
  jamBuka?: string;
  jamTutup?: string;
  status?: string;
}
export type UpdateGorInput = Partial<CreateGorInput>;

@Injectable()
export class GorService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) {
    return getTenantSchema(slug);
  }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [row] = await this.dbService.db
      .select({ slug: akademi.slug })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(eq(userAkademis.userId, userId))
      .limit(1);
    if (!row) throw new NotFoundException('Akademi/tenant tidak ditemukan untuk user ini');
    return row.slug;
  }

  async findAll(slug: string) {
    const tenant = this.getTenant(slug);
    return this.dbService.db.select().from(tenant.gor).orderBy(desc(tenant.gor.createdAt));
  }

  async findById(slug: string, id: string) {
    const tenant = this.getTenant(slug);
    const [row] = await this.dbService.db
      .select()
      .from(tenant.gor)
      .where(eq(tenant.gor.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('GOR tidak ditemukan');
    return row;
  }

  async create(slug: string, data: CreateGorInput) {
    const tenant = this.getTenant(slug);
    const [row] = await this.dbService.db
      .insert(tenant.gor)
      .values({
        nama: data.nama,
        alamat: data.alamat,
        kota: data.kota,
        telepon: data.telepon,
        deskripsi: data.deskripsi,
        fotoUrl: data.fotoUrl,
        jamBuka: data.jamBuka,
        jamTutup: data.jamTutup,
        status: data.status ?? 'aktif',
      })
      .returning();
    return row;
  }

  async update(slug: string, id: string, data: UpdateGorInput) {
    const tenant = this.getTenant(slug);
    await this.findById(slug, id);
    const [row] = await this.dbService.db
      .update(tenant.gor)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenant.gor.id, id))
      .returning();
    return row;
  }

  async remove(slug: string, id: string) {
    const tenant = this.getTenant(slug);
    await this.findById(slug, id);
    await this.dbService.db.delete(tenant.gor).where(eq(tenant.gor.id, id));
    return true;
  }
}