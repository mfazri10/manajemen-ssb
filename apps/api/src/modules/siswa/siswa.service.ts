import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc, like, sql } from 'drizzle-orm';

@Injectable()
export class SiswaService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) {
    return getTenantSchema(slug);
  }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [userAkademi] = await this.dbService.db
      .select({ slug: akademi.slug })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);

    if (!userAkademi) {
      throw new BadRequestException('User tidak memiliki akademi.');
    }
    return userAkademi.slug;
  }

  async findAll(slug: string) {
    const tenant = this.getTenant(slug);
    return this.dbService.db
      .select()
      .from(tenant.siswa)
      .orderBy(desc(tenant.siswa.createdAt));
  }

  async findById(slug: string, id: string) {
    const tenant = this.getTenant(slug);
    const [result] = await this.dbService.db
      .select()
      .from(tenant.siswa)
      .where(eq(tenant.siswa.id, id))
      .limit(1);

    if (!result) throw new NotFoundException('Siswa tidak ditemukan.');
    return result;
  }

  async create(slug: string, data: Record<string, unknown>) {
    const tenant = this.getTenant(slug);
    const insertData: Record<string, unknown> = {
      namaLengkap: data.namaLengkap,
      tanggalLahir: data.tanggalLahir,
    };

    // Only set fields that are provided
    if (data.namaPanggilan !== undefined) insertData.namaPanggilan = data.namaPanggilan;
    if (data.nisn !== undefined) insertData.nisn = data.nisn;
    if (data.nik !== undefined) insertData.nik = data.nik;
    if (data.tempatLahir !== undefined) insertData.tempatLahir = data.tempatLahir;
    if (data.jenisKelamin !== undefined) insertData.jenisKelamin = data.jenisKelamin;
    if (data.agama !== undefined) insertData.agama = data.agama;
    if (data.kelompokUmurId !== undefined) insertData.kelompokUmurId = data.kelompokUmurId;
    if (data.posisiId !== undefined) insertData.posisiId = data.posisiId;
    if (data.tinggiBadan !== undefined) insertData.tinggiBadan = String(data.tinggiBadan);
    if (data.beratBadan !== undefined) insertData.beratBadan = String(data.beratBadan);
    if (data.fotoUrl !== undefined) insertData.fotoUrl = data.fotoUrl;
    if (data.status !== undefined) insertData.status = data.status;
    if (data.klubSebelumnya !== undefined) insertData.klubSebelumnya = data.klubSebelumnya;
    if (data.provinsi !== undefined) insertData.provinsi = data.provinsi;
    if (data.kabupaten !== undefined) insertData.kabupaten = data.kabupaten;
    if (data.kecamatan !== undefined) insertData.kecamatan = data.kecamatan;
    if (data.desa !== undefined) insertData.desa = data.desa;
    if (data.alamatLengkap !== undefined) insertData.alamatLengkap = data.alamatLengkap;
    if (data.catatan !== undefined) insertData.catatan = data.catatan;

    const [result] = await this.dbService.db
      .insert(tenant.siswa)
      .values(insertData as any)
      .returning();
    return result;
  }

  async update(slug: string, id: string, data: Record<string, unknown>) {
    const tenant = this.getTenant(slug);
    await this.findById(slug, id);

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'namaLengkap', 'namaPanggilan', 'nisn', 'nik', 'tempatLahir', 'tanggalLahir',
      'jenisKelamin', 'agama', 'kelompokUmurId', 'posisiId', 'tinggiBadan', 'beratBadan',
      'fotoUrl', 'status', 'klubSebelumnya', 'provinsi', 'kabupaten', 'kecamatan',
      'desa', 'alamatLengkap', 'catatan',
    ];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = (key === 'tinggiBadan' || key === 'beratBadan') && typeof data[key] === 'number'
          ? String(data[key])
          : data[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Tidak ada data yang diubah.');
    }

    const [result] = await this.dbService.db
      .update(tenant.siswa)
      .set(updateData)
      .where(eq(tenant.siswa.id, id))
      .returning();
    return result;
  }

  async delete(slug: string, id: string) {
    const tenant = this.getTenant(slug);
    await this.findById(slug, id);
    await this.dbService.db.delete(tenant.siswa).where(eq(tenant.siswa.id, id));
    return true;
  }
}
