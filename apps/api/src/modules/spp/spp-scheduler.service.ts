import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema, akademi } from '@workspace/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class SppSchedulerService {
  private readonly logger = new Logger(SppSchedulerService.name);

  constructor(private readonly dbService: DrizzleService) {}

  // Jalankan setiap tanggal 1 awal bulan pukul 00:05
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlySppGeneration() {
    this.logger.log('Starting automated monthly SPP tagihan generation...');
    try {
      const result = await this.generateSppForCurrentMonth();
      this.logger.log(`Automated monthly SPP tagihan generation completed. Total tagihan generated: ${result.totalGenerated}`);
    } catch (error) {
      this.logger.error('Failed to generate monthly SPP tagihan:', error);
    }
  }

  async generateSppForCurrentMonth() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Jatuh tempo H+10 (tanggal 10 bulan berjalan)
    const dueDateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-10`;

    // 1. Ambil seluruh akademi yang terdaftar di database public
    const academies = await this.dbService.db.select({ slug: akademi.slug }).from(akademi);
    
    let totalGenerated = 0;

    for (const ac of academies) {
      if (!ac.slug) continue;
      try {
        const t = getTenantSchema(ac.slug);

        // 2. Ambil siswa aktif dari skema tenant
        const activeStudents = await this.dbService.db
          .select({ id: t.siswa.id })
          .from(t.siswa)
          .where(eq(t.siswa.status, 'aktif'));

        if (activeStudents.length === 0) continue;

        // 3. Masukkan tagihan SPP bulanan default (Rp 150.000) untuk masing-masing siswa
        const tagihanValues = activeStudents.map(student => ({
          siswaId: student.id,
          bulan: currentMonth,
          tahun: currentYear,
          jumlah: '150000', // Nominal default Rp 150.000
          status: 'belum',
          jatuhTempo: dueDateStr,
        }));

        // Drizzle mendukung .onConflictDoNothing() untuk menghindari duplicate key error
        await this.dbService.db
          .insert(t.sppTagihan)
          .values(tagihanValues)
          .onConflictDoNothing();

        totalGenerated += activeStudents.length;
        this.logger.log(`Generated SPP for tenant "${ac.slug}": ${activeStudents.length} students.`);
      } catch (err) {
        this.logger.error(`Failed to generate SPP for tenant "${ac.slug}":`, err);
      }
    }

    return { totalGenerated };
  }
}
