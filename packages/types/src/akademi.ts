// ── Akademi ────────────────────────────────────────────────────────────────────
export type PaketAkademi = 'gratis' | 'starter' | 'growth' | 'pro';

export interface Akademi {
  id: string;
  namaAkademi: string;
  slug: string;
  logoUrl?: string | null;
  alamat?: string | null;
  noHp?: string | null;
  email?: string | null;
  website?: string | null;
  paket: PaketAkademi;
  createdAt: string;
  updatedAt: string;
}

// ── Kelompok Umur ──────────────────────────────────────────────────────────────
export interface KelompokUmur {
  id: string;
  akademiId: string;
  nama: string;
  usiaMin?: number | null;
  usiaMax?: number | null;
  createdAt: string;
}

// ── Master Posisi ──────────────────────────────────────────────────────────────
export interface MasterPosisi {
  id: string;
  akademiId: string;
  kode: string;
  nama: string;
  createdAt: string;
}
