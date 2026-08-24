import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { affiliates, affiliateLinks, affiliateVisits } from '@workspace/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AffiliateTrackingService {
  constructor(private readonly dbService: DrizzleService) {}

  /**
   * Catat kunjungan baru dari link affiliate.
   * Dipanggil oleh middleware/endpoint saat user mengakses URL dengan ?ref= param.
   */
  async recordVisit(params: {
    kodeReferral: string;
    ipAddress?: string;
    userAgent?: string;
    referrerUrl?: string;
    slug?: string; // slug link affiliate jika diketahui
  }) {
    // Cari affiliate berdasarkan kode referral
    const [affiliate] = await this.dbService.db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(and(eq(affiliates.kodeReferral, params.kodeReferral), eq(affiliates.status, 'active')))
      .limit(1);

    if (!affiliate) return null;

    // Cari link tracking jika slug disertakan
    let linkId: string | null = null;
    if (params.slug) {
      const [link] = await this.dbService.db
        .select({ id: affiliateLinks.id })
        .from(affiliateLinks)
        .where(and(eq(affiliateLinks.slug, params.slug), eq(affiliateLinks.aktif, true)))
        .limit(1);
      if (link) {
        linkId = link.id;
        // Increment klik pada link
        await this.dbService.db
          .update(affiliateLinks)
          .set({ totalKlik: affiliateLinks.totalKlik as any + 1 })
          .where(eq(affiliateLinks.id, link.id));
      }
    }

    // Increment klik pada affiliate
    await this.dbService.db
      .update(affiliates)
      .set({ totalKlik: affiliates.totalKlik as any + 1 })
      .where(eq(affiliates.id, affiliate.id));

    // Simpan record kunjungan
    const [visit] = await this.dbService.db
      .insert(affiliateVisits)
      .values({
        affiliateId: affiliate.id,
        linkId: linkId ?? undefined,
        ipAddress: params.ipAddress as any,
        userAgent: params.userAgent,
        referrerUrl: params.referrerUrl,
      } as any)
      .returning();

    return visit;
  }

  /**
   * Tandai kunjungan sebagai telah terkonversi (tenant bayar).
   */
  async markVisitConverted(visitId: string) {
    await this.dbService.db
      .update(affiliateVisits)
      .set({ converted: true, convertedAt: new Date() })
      .where(eq(affiliateVisits.id, visitId));
  }

  /**
   * Cari affiliate aktif berdasarkan kode referral.
   * Digunakan saat payment webhook untuk mengecek apakah ada cookie referral.
   */
  async findAffiliateByKode(kodeReferral: string) {
    const [affiliate] = await this.dbService.db
      .select()
      .from(affiliates)
      .where(and(eq(affiliates.kodeReferral, kodeReferral), eq(affiliates.status, 'active')))
      .limit(1);
    return affiliate ?? null;
  }
}
