import { Injectable, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, sql, count } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  async getSummary(slug: string) {
    const t = this.getTenant(slug);

    const siswaRows = await this.dbService.db.select({ total: count() }).from(t.siswa);
    const siswaAktifRows = await this.dbService.db.select({ total: count() }).from(t.siswa).where(eq(t.siswa.status, 'aktif'));
    const siswaAlumniRows = await this.dbService.db.select({ total: count() }).from(t.siswa).where(eq(t.siswa.status, 'alumni'));
    const pelatihRows = await this.dbService.db.select({ total: count() }).from(t.pelatih);
    const jadwalRows = await this.dbService.db.select({ total: count() }).from(t.jadwalLatihan);
    const tagihanRows = await this.dbService.db.select({ total: count() }).from(t.sppTagihan).where(eq(t.sppTagihan.status, 'belum'));

    // Keuangan summary from bukuKas
    const pemasukanRows = await this.dbService.db.select({ total: sql<string>`coalesce(sum(${t.bukuKas.jumlah}), 0)` }).from(t.bukuKas).where(eq(t.bukuKas.tipe, 'pemasukan'));
    const pengeluaranRows = await this.dbService.db.select({ total: sql<string>`coalesce(sum(${t.bukuKas.jumlah}), 0)` }).from(t.bukuKas).where(eq(t.bukuKas.tipe, 'pengeluaran'));

    // Tabungan total
    const simpanRows = await this.dbService.db.select({ total: sql<string>`coalesce(sum(${t.tabungan.jumlah}), 0)` }).from(t.tabungan).where(eq(t.tabungan.tipe, 'simpan'));
    const tarikRows = await this.dbService.db.select({ total: sql<string>`coalesce(sum(${t.tabungan.jumlah}), 0)` }).from(t.tabungan).where(eq(t.tabungan.tipe, 'tarik'));

    const pemasukan = parseFloat(pemasukanRows[0]?.total || '0');
    const pengeluaran = parseFloat(pengeluaranRows[0]?.total || '0');
    const totalSimpan = parseFloat(simpanRows[0]?.total || '0');
    const totalTarik = parseFloat(tarikRows[0]?.total || '0');

    return {
      totalSiswa: siswaRows[0]?.total ?? 0,
      totalPelatih: pelatihRows[0]?.total ?? 0,
      totalJadwal: jadwalRows[0]?.total ?? 0,
      totalTagihanBelum: tagihanRows[0]?.total ?? 0,
      totalPemasukan: pemasukan,
      totalPengeluaran: pengeluaran,
      saldoKas: pemasukan - pengeluaran,
      totalTabungan: totalSimpan - totalTarik,
      siswaAktif: siswaAktifRows[0]?.total ?? 0,
      siswaAlumni: siswaAlumniRows[0]?.total ?? 0,
    };
  }
}
