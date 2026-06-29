import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class PelatihService {
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

  // === PELATIH ===
  async findAll(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.pelatih).orderBy(desc(t.pelatih.createdAt));
  }

  async findById(slug: string, id: string) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.select().from(t.pelatih).where(eq(t.pelatih.id, id)).limit(1);
    if (!r) throw new NotFoundException('Pelatih tidak ditemukan.');
    return r;
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.pelatih).values(data as any).returning();
    return result;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);
    const allowed = ['namaLengkap', 'noHp', 'email', 'tempatLahir', 'tanggalLahir', 'fotoUrl', 'status', 'provinsi', 'kabupaten', 'kecamatan', 'desa', 'catatan', 'userId'];
    const updateData: Record<string, unknown> = {};
    for (const k of allowed) { if (data[k] !== undefined) updateData[k] = data[k]; }
    if (Object.keys(updateData).length === 0) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.pelatih).set(updateData).where(eq(t.pelatih.id, id)).returning();
    return result;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);
    await this.dbService.db.delete(t.pelatih).where(eq(t.pelatih.id, id));
    return true;
  }

  // === LISENSI ===
  async findLisensi(slug: string, pelatihId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.pelatihLisensi).where(eq(t.pelatihLisensi.pelatihId, pelatihId));
  }

  async createLisensi(slug: string, data: { pelatihId: string; lisensi: string; lisensiLainnya?: string }) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.pelatihLisensi).values({
      pelatihId: data.pelatihId, lisensi: data.lisensi,
      ...(data.lisensiLainnya !== undefined && { lisensiLainnya: data.lisensiLainnya }),
    }).returning();
    return result;
  }

  async deleteLisensi(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.pelatihLisensi).where(eq(t.pelatihLisensi.id, id));
    return true;
  }

  // === JABATAN ===
  async findJabatan(slug: string, pelatihId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.pelatihJabatan).where(eq(t.pelatihJabatan.pelatihId, pelatihId));
  }

  async createJabatan(slug: string, data: { pelatihId: string; jabatan: string; kelompokUmurId?: string }) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.insert(t.pelatihJabatan).values({
      pelatihId: data.pelatihId, jabatan: data.jabatan,
      ...(data.kelompokUmurId !== undefined && { kelompokUmurId: data.kelompokUmurId }),
    }).returning();
    return result;
  }

  async deleteJabatan(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.pelatihJabatan).where(eq(t.pelatihJabatan.id, id));
    return true;
  }
}
