import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc, like, sql } from 'drizzle-orm';

export interface CreateLapanganInput {
  gorId: string;
  nama: string;
  tipe: string;
  permukaan?: string;
  indoor?: boolean;
  tarifPerJam?: number;
  kapasitas?: number;
  fotoUrl?: string;
  status?: string;
  keterangan?: string;
}
export type UpdateLapanganInput = Partial<CreateLapanganInput>;

@Injectable()
export class LapanganService {
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

  /** List semua lapangan; opsional filter berdasarkan gorId. */
  async findAll(slug: string, gorId?: string) {
    const tenant = this.getTenant(slug);
    const q = this.dbService.db.select().from(tenant.lapangan);
    if (gorId) {
      return q.where(eq(tenant.lapangan.gorId, gorId)).orderBy(desc(tenant.lapangan.createdAt));
    }
    return q.orderBy(desc(tenant.lapangan.createdAt));
  }

  async findById(slug: string, id: string) {
    const tenant = this.getTenant(slug);
    const [row] = await this.dbService.db
      .select()
      .from(tenant.lapangan)
      .where(eq(tenant.lapangan.id, id))
      .limit(1);
    if (!row) throw new NotFoundException('Lapangan tidak ditemukan');
    return row;
  }

  async create(slug: string, data: CreateLapanganInput) {
    const tenant = this.getTenant(slug);
    const [row] = await this.dbService.db
      .insert(tenant.lapangan)
      .values({
        gorId: data.gorId,
        nama: data.nama,
        tipe: data.tipe,
        permukaan: data.permukaan,
        indoor: data.indoor ?? true,
        tarifPerJam: data.tarifPerJam !== undefined ? String(data.tarifPerJam) : '0',
        kapasitas: data.kapasitas,
        fotoUrl: data.fotoUrl,
        status: data.status ?? 'tersedia',
        keterangan: data.keterangan,
      })
      .returning();
    return row;
  }

  async update(slug: string, id: string, data: UpdateLapanganInput) {
    const tenant = this.getTenant(slug);
    await this.findById(slug, id);
    const patch: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.tarifPerJam !== undefined) patch.tarifPerJam = String(data.tarifPerJam);
    const [row] = await this.dbService.db
      .update(tenant.lapangan)
      .set(patch)
      .where(eq(tenant.lapangan.id, id))
      .returning();
    return row;
  }

  async remove(slug: string, id: string) {
    const tenant = this.getTenant(slug);
    await this.findById(slug, id);
    await this.dbService.db.delete(tenant.lapangan).where(eq(tenant.lapangan.id, id));
    return true;
  }
}