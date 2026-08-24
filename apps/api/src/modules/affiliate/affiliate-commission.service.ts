import { Injectable } from '@nestjs/common';

// === Tier config ===
const TIER_CONFIG = {
  starter: { flat: 50_000, pctY1: 20, pctY2: 10 },
  growth:  { flat: 50_000, pctY1: 25, pctY2: 12 },
  pro:     { flat: 75_000, pctY1: 30, pctY2: 15 },
  elite:   { flat: 75_000, pctY1: 35, pctY2: 20 },
} as const;

type Tier = keyof typeof TIER_CONFIG;

export interface KomisiResult {
  flat: number;
  pct: number;
  total: number;
  pctRate: number;
}

@Injectable()
export class AffiliateCommissionService {
  /**
   * Menghitung komisi yang diperoleh affiliate untuk satu pembayaran langganan.
   * @param tier - Tier affiliate (starter/growth/pro/elite)
   * @param paymentAmount - Nilai pembayaran langganan (IDR)
   * @param bulanKe - Bulan ke-berapa tenant ini direferral membayar (1 = pembayaran pertama)
   * @param overrides - Override komisi individual jika ada
   */
  hitungKomisi(
    tier: string,
    paymentAmount: number,
    bulanKe: number,
    overrides?: {
      komisiFlatIdr?: string | null;
      komisiPctY1?: string | null;
      komisiPctY2?: string | null;
    },
  ): KomisiResult {
    const config = TIER_CONFIG[tier as Tier] ?? TIER_CONFIG.starter;

    // Komisi flat hanya diberikan saat pembayaran pertama (bulan ke-1)
    const flatAmount =
      bulanKe === 1
        ? Number(overrides?.komisiFlatIdr ?? config.flat)
        : 0;

    // Persen berbeda untuk tahun pertama vs. setelahnya
    const pctRate =
      bulanKe <= 12
        ? Number(overrides?.komisiPctY1 ?? config.pctY1)
        : Number(overrides?.komisiPctY2 ?? config.pctY2);

    const pctAmount = paymentAmount * (pctRate / 100);

    return {
      flat: flatAmount,
      pct: pctAmount,
      total: flatAmount + pctAmount,
      pctRate,
    };
  }

  /**
   * Tentukan tier baru berdasarkan jumlah referral aktif.
   */
  hitungTier(referralAktif: number): Tier {
    if (referralAktif >= 30) return 'elite';
    if (referralAktif >= 15) return 'pro';
    if (referralAktif >= 5)  return 'growth';
    return 'starter';
  }

  /**
   * Informasi progress menuju tier berikutnya.
   */
  tierProgress(referralAktif: number): {
    current: Tier;
    next: Tier | null;
    currentCount: number;
    nextTarget: number | null;
  } {
    const tier = this.hitungTier(referralAktif);
    const thresholds: { tier: Tier; min: number }[] = [
      { tier: 'starter', min: 0 },
      { tier: 'growth',  min: 5 },
      { tier: 'pro',     min: 15 },
      { tier: 'elite',   min: 30 },
    ];
    const idx = thresholds.findIndex((t) => t.tier === tier);
    const next = thresholds[idx + 1] ?? null;
    return {
      current: tier,
      next: next?.tier ?? null,
      currentCount: referralAktif,
      nextTarget: next?.min ?? null,
    };
  }
}
