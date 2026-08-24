import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { AffiliateCommissionService } from './affiliate-commission.service';
import { AffiliateTrackingService } from './affiliate-tracking.service';
import {
  affiliates,
  affiliateLinks,
  affiliateReferrals,
  affiliatePayouts,
  users,
} from '@workspace/db';
import { eq, and, desc, sql, count } from 'drizzle-orm';

@Injectable()
export class AffiliateService {
  constructor(
    private readonly dbService: DrizzleService,
    private readonly commissionService: AffiliateCommissionService,
    private readonly trackingService: AffiliateTrackingService,
  ) {}

  // =====================================================
  // HELPER
  // =====================================================
  private generateKodeReferral(nama: string): string {
    // Format: NAMA-XXXX (4 karakter acak)
    const slug = nama
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${slug}-${rand}`;
  }

  // =====================================================
  // AFFILIATE CRUD
  // =====================================================

  /**
   * Daftar jadi affiliate baru.
   */
  async register(userId: string, input: {
    namaBank?: string;
    nomorRekening?: string;
    atasNama?: string;
  }) {
    // Cek apakah sudah terdaftar
    const existing = await this.dbService.db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);

    if (existing.length > 0)
      throw new ConflictException('Anda sudah terdaftar sebagai affiliate.');

    // Ambil nama user
    const [user] = await this.dbService.db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new NotFoundException('User tidak ditemukan.');

    const kodeReferral = this.generateKodeReferral(user.name);

    const [affiliate] = await this.dbService.db
      .insert(affiliates)
      .values({
        userId,
        kodeReferral,
        namaBank: input.namaBank,
        nomorRekening: input.nomorRekening,
        atasNama: input.atasNama,
      } as any)
      .returning();

    // Buat link utama default
    await this.dbService.db
      .insert(affiliateLinks)
      .values({
        affiliateId: affiliate!.id,
        nama: 'Link Utama',
        slug: kodeReferral.toLowerCase(),
        targetUrl: '/register',
        utmCampaign: 'affiliate-default',
      } as any);

    return affiliate;
  }

  /**
   * Ambil profil affiliate berdasarkan user ID.
   */
  async findByUserId(userId: string) {
    const [affiliate] = await this.dbService.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId))
      .limit(1);
    return affiliate ?? null;
  }

  /**
   * Ambil profil affiliate berdasarkan affiliate ID.
   */
  async findById(id: string) {
    const [affiliate] = await this.dbService.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, id))
      .limit(1);
    return affiliate ?? null;
  }

  /**
   * Update info rekening bank affiliate.
   */
  async updateBank(affiliateId: string, input: {
    namaBank: string;
    nomorRekening: string;
    atasNama: string;
  }) {
    const [updated] = await this.dbService.db
      .update(affiliates)
      .set({ ...input, updatedAt: new Date() } as any)
      .where(eq(affiliates.id, affiliateId))
      .returning();
    return updated;
  }

  // =====================================================
  // ADMIN — Approve / Suspend
  // =====================================================

  async approveAffiliate(id: string) {
    const [updated] = await this.dbService.db
      .update(affiliates)
      .set({ status: 'active', approvedAt: new Date(), updatedAt: new Date() } as any)
      .where(eq(affiliates.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Affiliate tidak ditemukan.');
    return updated;
  }

  async suspendAffiliate(id: string, catatan?: string) {
    const [updated] = await this.dbService.db
      .update(affiliates)
      .set({ status: 'suspended', catatanAdmin: catatan, updatedAt: new Date() } as any)
      .where(eq(affiliates.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Affiliate tidak ditemukan.');
    return updated;
  }

  async findAll(status?: string) {
    const query = this.dbService.db.select().from(affiliates);
    if (status) return query.where(eq(affiliates.status, status));
    return query;
  }

  // =====================================================
  // LINKS
  // =====================================================

  async createLink(affiliateId: string, nama: string, utmCampaign?: string) {
    // Cek affiliate aktif
    const affiliate = await this.findById(affiliateId);
    if (!affiliate) throw new NotFoundException('Affiliate tidak ditemukan.');
    if (affiliate.status !== 'active')
      throw new BadRequestException('Akun affiliate tidak aktif.');

    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const slug = `${affiliate.kodeReferral}-${rand}`.toLowerCase();

    const [link] = await this.dbService.db
      .insert(affiliateLinks)
      .values({
        affiliateId,
        nama,
        slug,
        utmCampaign,
      } as any)
      .returning();
    return link;
  }

  async findLinks(affiliateId: string) {
    return this.dbService.db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.affiliateId, affiliateId));
  }

  // =====================================================
  // REFERRALS & CONVERSION
  // =====================================================

  /**
   * Proses konversi saat tenant baru berlangganan via referral.
   * Dipanggil oleh PaymentService saat menerima webhook Xendit PAID.
   */
  async processConversion(params: {
    akademiId: string;
    kodeReferral: string;
    paymentAmount: number;
    visitId?: string;
    linkId?: string;
  }) {
    const affiliate = await this.trackingService.findAffiliateByKode(params.kodeReferral);
    if (!affiliate) return null;

    // Anti self-referral: tidak boleh referral akademi yang userId-nya sama dengan affiliate
    // (cek dilakukan di payment service yang punya context userId)

    // Cek berapa kali akademi ini sudah bayar via affiliate ini
    const [countResult] = await this.dbService.db
      .select({ c: count() })
      .from(affiliateReferrals)
      .where(and(
        eq(affiliateReferrals.affiliateId, affiliate.id),
        eq(affiliateReferrals.akademiId, params.akademiId),
      ));
    const bulanKe = Number(countResult?.c ?? 0) + 1;

    // Hitung komisi
    const komisi = this.commissionService.hitungKomisi(
      affiliate.tier,
      params.paymentAmount,
      bulanKe,
      {
        komisiFlatIdr: affiliate.komisiFlatIdr,
        komisiPctY1: affiliate.komisiPctY1,
        komisiPctY2: affiliate.komisiPctY2,
      },
    );

    // Simpan referral
    const [referral] = await this.dbService.db
      .insert(affiliateReferrals)
      .values({
        affiliateId: affiliate.id,
        akademiId: params.akademiId,
        visitId: params.visitId,
        linkId: params.linkId,
        paymentAmount: String(params.paymentAmount),
        paymentBulanKe: bulanKe,
        komisiFlat: String(komisi.flat),
        komisiPctEarned: String(komisi.pct),
        komisiTotal: String(komisi.total),
      } as any)
      .returning();

    // Update saldo pending affiliate
    await this.dbService.db
      .update(affiliates)
      .set({
        saldoPending: sql`saldo_pending + ${komisi.total}`,
        totalKomisi: sql`total_komisi + ${komisi.total}`,
        totalReferral: bulanKe === 1 ? sql`total_referral + 1` : affiliates.totalReferral,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    // Tandai visit terkonversi jika ada visitId
    if (params.visitId) {
      await this.trackingService.markVisitConverted(params.visitId);
    }

    return referral;
  }

  /**
   * Admin approve referral → pindahkan dari saldo_pending ke saldo_tersedia.
   */
  async approveReferral(referralId: string) {
    const [referral] = await this.dbService.db
      .select()
      .from(affiliateReferrals)
      .where(eq(affiliateReferrals.id, referralId))
      .limit(1);

    if (!referral) throw new NotFoundException('Referral tidak ditemukan.');
    if (referral.status !== 'pending')
      throw new BadRequestException('Referral ini tidak dalam status pending.');

    await this.dbService.db
      .update(affiliateReferrals)
      .set({ status: 'approved', approvedAt: new Date() } as any)
      .where(eq(affiliateReferrals.id, referralId));

    // Pindahkan saldo: pending → tersedia
    await this.dbService.db
      .update(affiliates)
      .set({
        saldoPending: sql`saldo_pending - ${referral.komisiTotal}`,
        saldoTersedia: sql`saldo_tersedia + ${referral.komisiTotal}`,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, referral.affiliateId));

    // Recalculate tier berdasarkan jumlah referral aktif
    const [cntResult] = await this.dbService.db
      .select({ c: count() })
      .from(affiliateReferrals)
      .where(and(
        eq(affiliateReferrals.affiliateId, referral.affiliateId),
        eq(affiliateReferrals.paymentBulanKe, 1),
        eq(affiliateReferrals.status, 'approved'),
      ));
    const referralAktif = Number(cntResult?.c ?? 0);
    const newTier = this.commissionService.hitungTier(referralAktif);

    await this.dbService.db
      .update(affiliates)
      .set({ tier: newTier, updatedAt: new Date() } as any)
      .where(eq(affiliates.id, referral.affiliateId));

    return referral;
  }

  async findReferrals(affiliateId: string, status?: string) {
    const query = this.dbService.db
      .select()
      .from(affiliateReferrals)
      .where(eq(affiliateReferrals.affiliateId, affiliateId))
      .orderBy(desc(affiliateReferrals.createdAt));
    return query;
  }

  // =====================================================
  // STATS DASHBOARD
  // =====================================================

  async getStats(affiliateId: string) {
    const [affiliate] = await this.dbService.db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!affiliate) throw new NotFoundException('Affiliate tidak ditemukan.');

    // Hitung referral aktif (bayar pertama kali, status approved/paid)
    const [aktifResult] = await this.dbService.db
      .select({ c: count() })
      .from(affiliateReferrals)
      .where(and(
        eq(affiliateReferrals.affiliateId, affiliateId),
        eq(affiliateReferrals.paymentBulanKe, 1),
        // approved atau paid = dihitung aktif
      ));
    const referralAktif = Number(aktifResult?.c ?? 0);
    const progress = this.commissionService.tierProgress(referralAktif);

    return {
      totalKlik: affiliate.totalKlik,
      totalReferral: affiliate.totalReferral,
      totalKomisi: Number(affiliate.totalKomisi),
      saldoTersedia: Number(affiliate.saldoTersedia),
      saldoPending: Number(affiliate.saldoPending),
      referralAktif,
      tierSaatIni: affiliate.tier,
      tierProgress: progress,
    };
  }

  async findPayouts(affiliateId: string) {
    return this.dbService.db
      .select()
      .from(affiliatePayouts)
      .where(eq(affiliatePayouts.affiliateId, affiliateId))
      .orderBy(desc(affiliatePayouts.requestedAt));
  }
}
