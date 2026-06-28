// ── Enums ──────────────────────────────────────────────────────────────────────
export type StatusPelatih = 'aktif' | 'nonaktif';
export type JenisLisensi =
  | 'd_nasional' | 'c_afc' | 'b_afc' | 'a_afc' | 'pro_afc'
  | 'fisik' | 'kiper' | 'futsal' | 'lainnya';
export type JabatanPelatih =
  | 'pelatih_ku' | 'pelatih_kiper' | 'pelatih_fisik'
  | 'asisten' | 'kepala_pelatih' | 'koordinator';

// ── Pelatih ────────────────────────────────────────────────────────────────────
export interface Pelatih {
  id: string;
  akademiId: string;
  namaLengkap: string;
  noHp?: string | null;
  email?: string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  fotoUrl?: string | null;
  status: StatusPelatih;
  provinsi?: string | null;
  kabupaten?: string | null;
  kecamatan?: string | null;
  desa?: string | null;
  catatan?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Pelatih Lisensi ────────────────────────────────────────────────────────────
export interface PelatihLisensi {
  id: string;
  pelatihId: string;
  lisensi: JenisLisensi;
  lisensiLainnya?: string | null;
  createdAt: string;
}

// ── Pelatih Jabatan ────────────────────────────────────────────────────────────
export interface PelatihJabatan {
  id: string;
  pelatihId: string;
  kelompokUmurId?: string | null;
  jabatan: JabatanPelatih;
  createdAt: string;
}
