// ── Turnamen ───────────────────────────────────────────────────────────────────
export interface Turnamen {
  id: string;
  akademiId: string;
  nama: string;
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  lokasi?: string | null;
  kategoriUmur?: string | null;
  hasil?: string | null;
  createdAt: string;
}

export interface TurnamenPeserta {
  id: string;
  turnamenId: string;
  siswaId: string;
  posisi?: string | null;
  gol: number;
  kartuKuning: number;
  kartuMerah: number;
  menitBermain?: number | null;
  catatan?: string | null;
  createdAt: string;
}

// ── Match ──────────────────────────────────────────────────────────────────────
export type BabakMatch =
  | 'penyisihan' | 'perempat_final' | 'semi_final' | 'final' | 'grup' | 'friendly';
export type StatusMatch = 'belum' | 'berlangsung' | 'selesai' | 'batal';
export type TipeMatchEvent =
  | 'gol' | 'assist' | 'kartu_kuning' | 'kartu_merah' | 'substitusi' | 'own_goal';

export interface Match {
  id: string;
  turnamenId: string;
  babak: BabakMatch;
  matchNo?: number | null;
  tanggal?: string | null;
  waktu?: string | null;
  lokasi?: string | null;
  timHome: string;
  timAway: string;
  skorHome: number;
  skorAway: number;
  status: StatusMatch;
  catatan?: string | null;
  createdAt: string;
}

export interface MatchLineup {
  id: string;
  matchId: string;
  siswaId: string;
  tim: 'home' | 'away';
  posisi?: string | null;
  status: 'starter' | 'cadangan' | 'masuk' | 'keluar';
  menitMasuk?: number | null;
  menitKeluar?: number | null;
  createdAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  siswaId?: string | null;
  tipe: TipeMatchEvent;
  menit?: number | null;
  keterangan?: string | null;
  createdAt: string;
}
