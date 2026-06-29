import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class PendaftaranService {
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

  async findAll(slug: string, status?: string) {
    const t = this.getTenant(slug);
    const query = this.dbService.db.select().from(t.pendaftaran);
    if (status) {
      return query.where(eq(t.pendaftaran.status, status)).orderBy(desc(t.pendaftaran.createdAt));
    }
    return query.orderBy(desc(t.pendaftaran.createdAt));
  }

  async findById(slug: string, id: string) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db
      .select().from(t.pendaftaran).where(eq(t.pendaftaran.id, id)).limit(1);
    if (!result) throw new NotFoundException('Pendaftaran tidak ditemukan.');
    return result;
  }

  async create(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const insertData: Record<string, unknown> = {
      namaLengkap: data.namaLengkap,
    };
    if (data.akademiId !== undefined) insertData.akademiId = data.akademiId;
    if (data.tempatLahir !== undefined) insertData.tempatLahir = data.tempatLahir;
    if (data.tglLahir !== undefined) insertData.tglLahir = data.tglLahir;
    if (data.jenisKelamin !== undefined) insertData.jenisKelamin = data.jenisKelamin;
    if (data.alamat !== undefined) insertData.alamat = data.alamat;
    if (data.namaOrangTua !== undefined) insertData.namaOrangTua = data.namaOrangTua;
    if (data.noHpOrangTua !== undefined) insertData.noHpOrangTua = data.noHpOrangTua;
    if (data.email !== undefined) insertData.email = data.email;
    if (data.kelompokUmurId !== undefined) insertData.kelompokUmurId = data.kelompokUmurId;
    if (data.posisiId !== undefined) insertData.posisiId = data.posisiId;
    if (data.status !== undefined) insertData.status = data.status;
    if (data.fotoUrl !== undefined) insertData.fotoUrl = data.fotoUrl;
    if (data.dokumenUrl !== undefined) insertData.dokumenUrl = data.dokumenUrl;

    const [result] = await this.dbService.db.insert(t.pendaftaran).values(insertData as any).returning();
    return result;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'namaLengkap', 'tempatLahir', 'tglLahir', 'jenisKelamin', 'alamat',
      'namaOrangTua', 'noHpOrangTua', 'email', 'kelompokUmurId', 'posisiId',
      'status', 'fotoUrl', 'dokumenUrl',
    ];
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Tidak ada data yang diubah.');
    }

    const [result] = await this.dbService.db
      .update(t.pendaftaran).set(updateData).where(eq(t.pendaftaran.id, id)).returning();
    return result;
  }

  async delete(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);
    await this.dbService.db.delete(t.pendaftaran).where(eq(t.pendaftaran.id, id));
    return true;
  }

  async verifikasi(slug: string, id: string, status: string, catatan?: string) {
    const t = this.getTenant(slug);
    await this.findById(slug, id);
    const updateData: Record<string, unknown> = { status };
    if (catatan !== undefined) updateData.catatan = catatan;
    const [result] = await this.dbService.db
      .update(t.pendaftaran).set(updateData).where(eq(t.pendaftaran.id, id)).returning();
    return result;
  }
}
