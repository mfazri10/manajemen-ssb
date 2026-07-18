import { Controller, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Controller('v1/siswa')
@UseGuards(AuthGuard)
export class SiswaImportController {
  constructor(private readonly dbService: DrizzleService) {}

  @Post('import')
  async importSiswa(
    @Req() req: any,
    @Body('csvContent') csvContent: string,
  ) {
    const tenantSlug = req.tenantSlug;
    if (!tenantSlug) {
      throw new BadRequestException('Context tenant tidak ditemukan. Silakan login ulang.');
    }

    if (!csvContent || csvContent.trim().length === 0) {
      throw new BadRequestException('Content CSV kosong.');
    }

    const tenant = getTenantSchema(tenantSlug);
    const db = this.dbService.db;

    // 1. Ambil semua kelompok umur default dari tenant ini
    const activeKelompokUmur = await db.select().from(tenant.kelompokUmur);

    // 2. Parse CSV
    const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) {
      throw new BadRequestException('CSV hanya berisi header atau kosong.');
    }

    const header = lines[0]!.toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Cari index kolom
    const idxNama = header.indexOf('nama lengkap');
    const idxTgl = header.indexOf('tanggal lahir');
    const idxKU = header.indexOf('kelompok umur');
    const idxHp = header.indexOf('no hp ortu');
    const idxNisn = header.indexOf('nisn');
    const idxNik = header.indexOf('nik');

    if (idxNama === -1 || idxTgl === -1) {
      throw new BadRequestException('Kolom wajib "Nama Lengkap" dan "Tanggal Lahir" tidak ditemukan di header CSV.');
    }

    const successRows: any[] = [];
    const errorRows: { row: number; error: string; data: string }[] = [];

    // 3. Jalankan transaksi database
    await db.transaction(async (tx) => {
      for (let i = 1; i < lines.length; i++) {
        const rowText = lines[i]!;
        // Simple CSV splitter yang menghormati tanda kutip (quotes)
        const row = rowText.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(r => r.trim().replace(/^["']|["']$/g, ''));
        
        try {
          const namaLengkap = row[idxNama];
          const tanggalLahirStr = row[idxTgl];

          if (!namaLengkap || !tanggalLahirStr) {
            throw new Error('Nama Lengkap atau Tanggal Lahir kosong');
          }

          // Validasi format tanggal YYYY-MM-DD
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(tanggalLahirStr)) {
            throw new Error(`Format tanggal lahir harus YYYY-MM-DD (contoh: 2015-03-10), ditemukan: ${tanggalLahirStr}`);
          }

          // Cari kelompok umur ID
          let kelompokUmurId: string | null = null;
          if (idxKU !== -1 && row[idxKU]) {
            const kuName = row[idxKU]!.toLowerCase().replace(/\s+/g, '');
            const matchedKU = activeKelompokUmur.find(
              ku => ku.nama.toLowerCase().replace(/\s+/g, '') === kuName
            );
            if (matchedKU) {
              kelompokUmurId = matchedKU.id;
            }
          }

          const nisn = idxNisn !== -1 ? row[idxNisn] || null : null;
          const nik = idxNik !== -1 ? row[idxNik] || null : null;
          const noHp = idxHp !== -1 ? row[idxHp] || null : null;

          // Insert Siswa
          const newSiswaId = randomUUID();
          await tx.insert(tenant.siswa).values({
            id: newSiswaId,
            namaLengkap,
            tanggalLahir: tanggalLahirStr,
            kelompokUmurId: kelompokUmurId || undefined,
            nisn,
            nik,
            status: 'aktif',
          } as any);

          // Insert Orang Tua (jika noHp ortu atau nama ada)
          if (noHp) {
            await tx.insert(tenant.orangTua).values({
              id: randomUUID(),
              siswaId: newSiswaId,
              namaOrangTua: `Ortu ${namaLengkap}`,
              hpOrangTua: noHp,
            } as any);
          }

          successRows.push({ namaLengkap, tanggalLahirStr });
        } catch (err: any) {
          errorRows.push({
            row: i + 1,
            error: err?.message || String(err),
            data: rowText,
          });
        }
      }

      // Jika ada error sama sekali, kita bisa rollback atau abaikan.
      // Demi user experience yang mudah (all or nothing), jika ada error di baris manapun,
      // kita batalkan seluruh transaksi agar user bisa memperbaikinya dulu.
      if (errorRows.length > 0) {
        throw new BadRequestException({
          message: 'Gagal mengimpor CSV karena beberapa baris tidak valid.',
          errors: errorRows,
        });
      }
    });

    return {
      message: `Berhasil mengimpor ${successRows.length} data siswa.`,
      importedCount: successRows.length,
    };
  }
}
