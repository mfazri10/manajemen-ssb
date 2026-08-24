import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { affiliates, affiliateReferrals } from '@workspace/db';
import { eq, and, lte, sql } from 'drizzle-orm';

@Injectable()
export class AffiliateCronService {
  private readonly logger = new Logger(AffiliateCronService.name);

  constructor(private readonly dbService: DrizzleService) {}

  /**
   * Auto-approve referral yang sudah melewati 30 hari grace period.
   * Berjalan setiap hari pukul 02:00 WIB.
   */
  @Cron('0 2 * * *', { name: 'affiliate-auto-approve', timeZone: 'Asia/Jakarta' })
  async autoApproveReferrals() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.logger.log('[Affiliate Cron] Memeriksa referral yang siap di-auto-approve...');

    try {
      // Ambil semua referral 'pending' yang berumur > 30 hari
      const pendingReferrals = await this.dbService.db
        .select()
        .from(affiliateReferrals)
        .where(
          and(
            eq(affiliateReferrals.status, 'pending'),
            lte(affiliateReferrals.conversionAt, thirtyDaysAgo),
          ),
        );

      if (pendingReferrals.length === 0) {
        this.logger.log('[Affiliate Cron] Tidak ada referral yang perlu di-approve hari ini.');
        return;
      }

      this.logger.log(`[Affiliate Cron] Ditemukan ${pendingReferrals.length} referral untuk di-auto-approve.`);

      let approved = 0;
      for (const referral of pendingReferrals) {
        try {
          // Update status referral ke 'approved'
          await this.dbService.db
            .update(affiliateReferrals)
            .set({ status: 'approved', approvedAt: new Date() } as any)
            .where(eq(affiliateReferrals.id, referral.id));

          // Pindahkan saldo dari pending ke tersedia
          await this.dbService.db
            .update(affiliates)
            .set({
              saldoPending:   sql`saldo_pending - ${referral.komisiTotal}`,
              saldoTersedia:  sql`saldo_tersedia + ${referral.komisiTotal}`,
              updatedAt:      new Date(),
            })
            .where(eq(affiliates.id, referral.affiliateId));

          approved++;
        } catch (err: any) {
          this.logger.error(`[Affiliate Cron] Gagal approve referral ${referral.id}: ${err?.message}`);
        }
      }

      this.logger.log(`[Affiliate Cron] Berhasil auto-approve ${approved}/${pendingReferrals.length} referral.`);
    } catch (err: any) {
      this.logger.error(`[Affiliate Cron] Error saat auto-approve: ${err?.message}`);
    }
  }
}
