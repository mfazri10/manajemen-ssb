import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class MasterDataService {
  constructor(private readonly dbService: DrizzleService) {}

  // Helper to get tenant tables from slug
  private getTenant(slug: string) {
    return getTenantSchema(slug);
  }

  // Resolve tenant slug from userId
  async resolveTenantSlug(userId: string): Promise<string> {
    const [userAkademi] = await this.dbService.db
      .select({ slug: akademi.slug })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);

    if (!userAkademi) {
      throw new UnauthorizedException('User tidak memiliki akademi.');
    }

    return userAkademi.slug;
  }

  // ========================
  // KELOMPOK UMUR
  // ========================
  async findAllKelompokUmur(tenantSlug: string) {
    const tenant = this.getTenant(tenantSlug);
    return this.dbService.db
      .select()
      .from(tenant.kelompokUmur)
      .orderBy(desc(tenant.kelompokUmur.createdAt));
  }

  async createKelompokUmur(tenantSlug: string, data: { nama: string; usiaMin?: number; usiaMax?: number }) {
    const tenant = this.getTenant(tenantSlug);
    const [result] = await this.dbService.db
      .insert(tenant.kelompokUmur)
      .values({
        nama: data.nama,
        ...(data.usiaMin !== undefined && { usiaMin: data.usiaMin }),
        ...(data.usiaMax !== undefined && { usiaMax: data.usiaMax }),
      })
      .returning();
    return result;
  }

  async updateKelompokUmur(tenantSlug: string, id: string, data: { nama?: string; usiaMin?: number; usiaMax?: number }) {
    const tenant = this.getTenant(tenantSlug);
    const existing = await this.dbService.db
      .select()
      .from(tenant.kelompokUmur)
      .where(eq(tenant.kelompokUmur.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Kelompok umur tidak ditemukan.');
    }

    const updateData: Record<string, unknown> = {};
    if (data.nama !== undefined) updateData.nama = data.nama;
    if (data.usiaMin !== undefined) updateData.usiaMin = data.usiaMin;
    if (data.usiaMax !== undefined) updateData.usiaMax = data.usiaMax;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Tidak ada data yang diubah.');
    }

    const [result] = await this.dbService.db
      .update(tenant.kelompokUmur)
      .set(updateData)
      .where(eq(tenant.kelompokUmur.id, id))
      .returning();
    return result;
  }

  async deleteKelompokUmur(tenantSlug: string, id: string) {
    const tenant = this.getTenant(tenantSlug);
    const existing = await this.dbService.db
      .select()
      .from(tenant.kelompokUmur)
      .where(eq(tenant.kelompokUmur.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Kelompok umur tidak ditemukan.');
    }

    await this.dbService.db
      .delete(tenant.kelompokUmur)
      .where(eq(tenant.kelompokUmur.id, id));
    return true;
  }

  // ========================
  // MASTER POSISI
  // ========================
  async findAllMasterPosisi(tenantSlug: string) {
    const tenant = this.getTenant(tenantSlug);
    return this.dbService.db
      .select()
      .from(tenant.masterPosisi)
      .orderBy(desc(tenant.masterPosisi.createdAt));
  }

  async createMasterPosisi(tenantSlug: string, data: { kode: string; nama: string }) {
    const tenant = this.getTenant(tenantSlug);
    const [result] = await this.dbService.db
      .insert(tenant.masterPosisi)
      .values({
        kode: data.kode,
        nama: data.nama,
      })
      .returning();
    return result;
  }

  async updateMasterPosisi(tenantSlug: string, id: string, data: { kode?: string; nama?: string }) {
    const tenant = this.getTenant(tenantSlug);
    const existing = await this.dbService.db
      .select()
      .from(tenant.masterPosisi)
      .where(eq(tenant.masterPosisi.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Master posisi tidak ditemukan.');
    }

    const updateData: Record<string, unknown> = {};
    if (data.kode !== undefined) updateData.kode = data.kode;
    if (data.nama !== undefined) updateData.nama = data.nama;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Tidak ada data yang diubah.');
    }

    const [result] = await this.dbService.db
      .update(tenant.masterPosisi)
      .set(updateData)
      .where(eq(tenant.masterPosisi.id, id))
      .returning();
    return result;
  }

  async deleteMasterPosisi(tenantSlug: string, id: string) {
    const tenant = this.getTenant(tenantSlug);
    const existing = await this.dbService.db
      .select()
      .from(tenant.masterPosisi)
      .where(eq(tenant.masterPosisi.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Master posisi tidak ditemukan.');
    }

    await this.dbService.db
      .delete(tenant.masterPosisi)
      .where(eq(tenant.masterPosisi.id, id));
    return true;
  }

  // ========================
  // MASTER PELANGGARAN
  // ========================
  async findAllMasterPelanggaran(tenantSlug: string) {
    const tenant = this.getTenant(tenantSlug);
    return this.dbService.db
      .select()
      .from(tenant.masterPelanggaran)
      .orderBy(desc(tenant.masterPelanggaran.createdAt));
  }

  async createMasterPelanggaran(tenantSlug: string, data: { nama: string; poin?: number }) {
    const tenant = this.getTenant(tenantSlug);
    const [result] = await this.dbService.db
      .insert(tenant.masterPelanggaran)
      .values({
        nama: data.nama,
        ...(data.poin !== undefined && { poin: data.poin }),
      })
      .returning();
    return result;
  }

  async updateMasterPelanggaran(tenantSlug: string, id: string, data: { nama?: string; poin?: number }) {
    const tenant = this.getTenant(tenantSlug);
    const existing = await this.dbService.db
      .select()
      .from(tenant.masterPelanggaran)
      .where(eq(tenant.masterPelanggaran.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Master pelanggaran tidak ditemukan.');
    }

    const updateData: Record<string, unknown> = {};
    if (data.nama !== undefined) updateData.nama = data.nama;
    if (data.poin !== undefined) updateData.poin = data.poin;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Tidak ada data yang diubah.');
    }

    const [result] = await this.dbService.db
      .update(tenant.masterPelanggaran)
      .set(updateData)
      .where(eq(tenant.masterPelanggaran.id, id))
      .returning();
    return result;
  }

  async deleteMasterPelanggaran(tenantSlug: string, id: string) {
    const tenant = this.getTenant(tenantSlug);
    const existing = await this.dbService.db
      .select()
      .from(tenant.masterPelanggaran)
      .where(eq(tenant.masterPelanggaran.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Master pelanggaran tidak ditemukan.');
    }

    await this.dbService.db
      .delete(tenant.masterPelanggaran)
      .where(eq(tenant.masterPelanggaran.id, id));
    return true;
  }
}
