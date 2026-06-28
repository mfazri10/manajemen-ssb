// ── SPP ────────────────────────────────────────────────────────────────────────
export type StatusSPP = 'lunas' | 'belum' | 'dispensasi';
export type MetodePembayaran = 'tunai' | 'transfer' | 'qris' | 'lainnya';

export interface SppTagihan {
  id: string;
  siswaId: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  status: StatusSPP;
  jatuhTempo?: string | null;
  createdAt: string;
}

export interface SppPembayaran {
  id: string;
  tagihanId: string;
  tanggalBayar: string;
  jumlah: number;
  metode?: MetodePembayaran | null;
  buktiUrl?: string | null;
  keterangan?: string | null;
  createdAt: string;
}

// ── Buku Kas ───────────────────────────────────────────────────────────────────
export type TipeBukuKas = 'masuk' | 'keluar';

export interface BukuKas {
  id: string;
  akademiId: string;
  tanggal: string;
  tipe: TipeBukuKas;
  kategori?: string | null;
  jumlah: number;
  keterangan?: string | null;
  createdAt: string;
}

// ── Tabungan ───────────────────────────────────────────────────────────────────
export type TipeTabungan = 'simpan' | 'tarik';

export interface Tabungan {
  id: string;
  siswaId: string;
  tanggal: string;
  tipe: TipeTabungan;
  jumlah: number;
  keterangan?: string | null;
  createdAt: string;
}
