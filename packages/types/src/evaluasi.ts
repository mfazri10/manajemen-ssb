// ── Evaluasi ───────────────────────────────────────────────────────────────────
export interface Evaluasi {
  id: string;
  siswaId: string;
  pelatihId?: string | null;
  semester: string;
  tahunAjaran: string;
  teknik?: number | null;
  fisik?: number | null;
  taktik?: number | null;
  mental?: number | null;
  catatanPelatih?: string | null;
  createdAt: string;
}

// ── Tes Fisik ──────────────────────────────────────────────────────────────────
export interface TesFisik {
  id: string;
  siswaId: string;
  kelompokUmurId?: string | null;
  tanggal: string;
  jenisTes: string;
  nilai: number;
  satuan?: string | null;
  catatan?: string | null;
  createdAt: string;
}

// ── Seleksi ────────────────────────────────────────────────────────────────────
export type StatusSeleksi = 'daftar' | 'lulus' | 'tidak_lulus';

export interface Seleksi {
  id: string;
  akademiId: string;
  nama: string;
  tanggal?: string | null;
  lokasi?: string | null;
  keterangan?: string | null;
  createdAt: string;
}

export interface SeleksiPeserta {
  id: string;
  seleksiId: string;
  siswaId: string;
  status: StatusSeleksi;
  nilai?: number | null;
  catatan?: string | null;
  createdAt: string;
}
