import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { affiliates, affiliatePayouts, affiliatePayoutItems, affiliateReferrals } from '@workspace/db';
import { eq, and, inArray, sql } from 'drizzle-orm';

const MIN_PAYOUT = 50_000; // IDR — minimum saldo untuk bisa dicairkan

@Injectable()
export class AffiliatePayoutService {
  constructor(private readonly dbService: DrizzleService) {}

  /**
   * Ajukan pencairan komisi.
   * Mengumpulkan semua referral yang sudah 'approved' untuk dicairkan sekaligus.
   */
  async requestPayout(affiliateId: string, jumlah: number, metode: string) {
    // Validasi data affiliate
    const [affiliate] = await this.dbService.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!affiliate) throw new NotFoundException('Affiliate tidak ditemukan.');
    if (affiliate.status !== 'active')
      throw new BadRequestException('Akun affiliate tidak aktif.');

    const saldoTersedia = Number(affiliate.saldoTersedia);
    if (saldoTersedia < MIN_PAYOUT)
      throw new BadRequestException(
        `Saldo minimum pencairan adalah Rp ${MIN_PAYOUT.toLocaleString('id-ID')}. Saldo Anda: Rp ${saldoTersedia.toLocaleString('id-ID')}.`,
      );
    if (jumlah > saldoTersedia)
      throw new BadRequestException('Jumlah pencairan melebihi saldo tersedia.');
    if (jumlah < MIN_PAYOUT)
      throw new BadRequestException(`Minimum pencairan adalah Rp ${MIN_PAYOUT.toLocaleString('id-ID')}.`);

    // Cek tidak ada pencairan yang masih dalam proses
    const pending = await this.dbService.db
      .select({ id: affiliatePayouts.id })
      .from(affiliatePayouts)
      .where(and(
        eq(affiliatePayouts.affiliateId, affiliateId),
        inArray(affiliatePayouts.status, ['requested', 'processing']),
      ));
    if (pending.length > 0)
      throw new BadRequestException('Masih ada permintaan pencairan yang sedang diproses.');

    // Ambil referral approved yang belum dibayar
    const referralsApproved = await this.dbService.db
      .select()
      .from(affiliateReferrals)
      .where(and(
        eq(affiliateReferrals.affiliateId, affiliateId),
        eq(affiliateReferrals.status, 'approved'),
      ));

    if (referralsApproved.length === 0)
      throw new BadRequestException('Tidak ada komisi yang siap dicairkan.');

    // Buat payout + payout items
    const [payout] = await this.dbService.db
      .insert(affiliatePayouts)
      .values({
        affiliateId,
        jumlah: String(jumlah),
        metode,
      } as any)
      .returning();

    // Insert payout items (link referral ke payout)
    const items = referralsApproved.map((r) => ({
      payoutId: payout!.id,
      referralId: r.id,
      jumlah: String(r.komisiTotal),
    }));
    if (items.length > 0) {
      await this.dbService.db.insert(affiliatePayoutItems).values(items as any);
    }

    // Update referral status ke 'paid'
    await this.dbService.db
      .update(affiliateReferrals)
      .set({ status: 'paid', paidAt: new Date() })
      .where(and(
        eq(affiliateReferrals.affiliateId, affiliateId),
        eq(affiliateReferrals.status, 'approved'),
      ));

    // Kurangi saldo tersedia
    await this.dbService.db
      .update(affiliates)
      .set({
        saldoTersedia: sql`saldo_tersedia - ${jumlah}`,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliateId));

    return payout;
  }

  /**
   * Admin memproses pencairan (tandai sebagai paid + upload bukti transfer).
   */
  async processPayout(payoutId: string, referensiBiaya?: string, buktiTransfer?: string) {
    const [existing] = await this.dbService.db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.id, payoutId))
      .limit(1);

    if (!existing) throw new NotFoundException('Permintaan pencairan tidak ditemukan.');
    if (existing.status === 'paid')
      throw new BadRequestException('Pencairan ini sudah diproses sebelumnya.');

    const [updated] = await this.dbService.db
      .update(affiliatePayouts)
      .set({
        status: 'paid',
        referensiBiaya,
        buktiTransfer,
        processedAt: new Date(),
        paidAt: new Date(),
      } as any)
      .where(eq(affiliatePayouts.id, payoutId))
      .returning();

    return updated;
  }

  /**
   * List riwayat pencairan seorang affiliate.
   */
  async findByAffiliate(affiliateId: string) {
    return this.dbService.db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.affiliateId, affiliateId));
  }

  /**
   * List semua permintaan pencairan (untuk admin).
   */
  async findAll(status?: string) {
    const query = this.dbService.db.select().from(affiliatePayouts);
    if (status) {
      return query.where(eq(affiliatePayouts.status, status));
    }
    return query;
  }
}
