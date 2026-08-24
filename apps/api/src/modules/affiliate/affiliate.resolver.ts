import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AffiliateService } from './affiliate.service';
import { AffiliatePayoutService } from './affiliate-payout.service';
import {
  Affiliate,
  AffiliateStats,
  AffiliateReferral,
  AffiliateLink,
  AffiliatePayout,
} from './entities/affiliate.entity';

@Resolver()
export class AffiliateResolver {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly payoutService: AffiliatePayoutService,
  ) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /** Profil affiliate saya */
  @Query(() => Affiliate, { name: 'myAffiliate', nullable: true })
  @UseGuards(AuthGuard)
  async myAffiliate(@Context() ctx: any) {
    const userId = ctx.req.user?.id;
    return this.affiliateService.findByUserId(userId);
  }

  /** Statistik dashboard affiliate */
  @Query(() => AffiliateStats, { name: 'myAffiliateStats', nullable: true })
  @UseGuards(AuthGuard)
  async myAffiliateStats(@Context() ctx: any) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) return null;
    return this.affiliateService.getStats(affiliate.id);
  }

  /** List referral saya */
  @Query(() => [AffiliateReferral], { name: 'myReferrals' })
  @UseGuards(AuthGuard)
  async myReferrals(
    @Context() ctx: any,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) return [];
    return this.affiliateService.findReferrals(affiliate.id, status);
  }

  /** List link tracking saya */
  @Query(() => [AffiliateLink], { name: 'myAffiliateLinks' })
  @UseGuards(AuthGuard)
  async myAffiliateLinks(@Context() ctx: any) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) return [];
    return this.affiliateService.findLinks(affiliate.id);
  }

  /** Riwayat pencairan saya */
  @Query(() => [AffiliatePayout], { name: 'myPayouts' })
  @UseGuards(AuthGuard)
  async myPayouts(@Context() ctx: any) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) return [];
    return this.affiliateService.findPayouts(affiliate.id);
  }

  // === SUPER ADMIN ===

  /** Semua affiliate (admin) */
  @Query(() => [Affiliate], { name: 'allAffiliates' })
  @UseGuards(AuthGuard)
  async allAffiliates(@Args('status', { nullable: true }) status?: string) {
    return this.affiliateService.findAll(status);
  }

  /** Detail 1 affiliate (admin) */
  @Query(() => Affiliate, { name: 'affiliateById', nullable: true })
  @UseGuards(AuthGuard)
  async affiliateById(@Args('id') id: string) {
    return this.affiliateService.findById(id);
  }

  /** Semua permintaan pencairan (admin) */
  @Query(() => [AffiliatePayout], { name: 'allPayouts' })
  @UseGuards(AuthGuard)
  async allPayouts(@Args('status', { nullable: true }) status?: string) {
    return this.payoutService.findAll(status);
  }

  // ============================================================
  // MUTATIONS
  // ============================================================

  /** Daftar jadi affiliate */
  @Mutation(() => Affiliate, { name: 'registerAffiliate' })
  @UseGuards(AuthGuard)
  async registerAffiliate(
    @Context() ctx: any,
    @Args('namaBank', { nullable: true }) namaBank?: string,
    @Args('nomorRekening', { nullable: true }) nomorRekening?: string,
    @Args('atasNama', { nullable: true }) atasNama?: string,
  ) {
    const userId = ctx.req.user?.id;
    return this.affiliateService.register(userId, {
      ...(namaBank !== undefined && { namaBank }),
      ...(nomorRekening !== undefined && { nomorRekening }),
      ...(atasNama !== undefined && { atasNama }),
    });
  }

  /** Buat link tracking baru */
  @Mutation(() => AffiliateLink, { name: 'createAffiliateLink' })
  @UseGuards(AuthGuard)
  async createAffiliateLink(
    @Context() ctx: any,
    @Args('nama') nama: string,
    @Args('utmCampaign', { nullable: true }) utmCampaign?: string,
  ) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) throw new Error('Anda belum terdaftar sebagai affiliate.');
    return this.affiliateService.createLink(affiliate.id, nama, utmCampaign);
  }

  /** Update info bank */
  @Mutation(() => Affiliate, { name: 'updateAffiliateBank' })
  @UseGuards(AuthGuard)
  async updateAffiliateBank(
    @Context() ctx: any,
    @Args('namaBank') namaBank: string,
    @Args('nomorRekening') nomorRekening: string,
    @Args('atasNama') atasNama: string,
  ) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) throw new Error('Anda belum terdaftar sebagai affiliate.');
    return this.affiliateService.updateBank(affiliate.id, { namaBank, nomorRekening, atasNama });
  }

  /** Ajukan pencairan */
  @Mutation(() => AffiliatePayout, { name: 'requestPayout' })
  @UseGuards(AuthGuard)
  async requestPayout(
    @Context() ctx: any,
    @Args('jumlah') jumlah: number,
    @Args('metode') metode: string,
  ) {
    const userId = ctx.req.user?.id;
    const affiliate = await this.affiliateService.findByUserId(userId);
    if (!affiliate) throw new Error('Anda belum terdaftar sebagai affiliate.');
    return this.payoutService.requestPayout(affiliate.id, jumlah, metode);
  }

  // === SUPER ADMIN ===

  /** Approve affiliate baru */
  @Mutation(() => Affiliate, { name: 'approveAffiliate' })
  @UseGuards(AuthGuard)
  async approveAffiliate(@Args('id') id: string) {
    return this.affiliateService.approveAffiliate(id);
  }

  /** Suspend affiliate */
  @Mutation(() => Affiliate, { name: 'suspendAffiliate' })
  @UseGuards(AuthGuard)
  async suspendAffiliate(
    @Args('id') id: string,
    @Args('alasan', { nullable: true }) alasan?: string,
  ) {
    return this.affiliateService.suspendAffiliate(id, alasan);
  }

  /** Approve referral (komisi pending → approved) */
  @Mutation(() => AffiliateReferral, { name: 'approveReferral' })
  @UseGuards(AuthGuard)
  async approveReferral(@Args('id') id: string) {
    return this.affiliateService.approveReferral(id);
  }

  /** Proses pencairan (admin tandai lunas) */
  @Mutation(() => AffiliatePayout, { name: 'processPayout' })
  @UseGuards(AuthGuard)
  async processPayout(
    @Args('id') id: string,
    @Args('referensiBiaya', { nullable: true }) referensiBiaya?: string,
    @Args('buktiTransfer', { nullable: true }) buktiTransfer?: string,
  ) {
    return this.payoutService.processPayout(id, referensiBiaya, buktiTransfer);
  }
}
