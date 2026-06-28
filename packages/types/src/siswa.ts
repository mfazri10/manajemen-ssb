// ── Enums ──────────────────────────────────────────────────────────────────────
export type StatusSiswa = 'aktif' | 'alumni' | 'nonaktif' | 'pending';
export type JenisKelamin = 'L' | 'P';

// ── Siswa ──────────────────────────────────────────────────────────────────────
export interface Siswa {
  id: string;
  akademiId: string;
  kelompokUmurId?: string | null;
  nisn?: string | null;
  nik?: string | null;
  namaLengkap: string;
  namaPanggilan?: string | null;
  tempatLahir?: string | null;
  tanggalLahir: string;
  jenisKelamin?: JenisKelamin | null;
  agama?: string | null;
  posisiId?: string | null;
  tinggiBadan?: number | null;
  beratBadan?: number | null;
  fotoUrl?: string | null;
  status: StatusSiswa;
  klubSebelumnya?: string | null;
  provinsi?: string | null;
  kabupaten?: string | null;
  kecamatan?: string | null;
  desa?: string | null;
  alamatLengkap?: string | null;
  catatan?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Orang Tua ──────────────────────────────────────────────────────────────────
export interface OrangTua {
  id: string;
  siswaId: string;
  namaOrangTua: string;
  hpOrangTua: string;
  hpAyah?: string | null;
  hpIbu?: string | null;
  email?: string | null;
  hubungan?: string | null;
  createdAt: string;
}

// ── Dokumen Siswa ──────────────────────────────────────────────────────────────
export type JenisDokumen = 'akta' | 'kk' | 'nisn' | 'kartu_pelajar' | 'raport';

export interface DokumenSiswa {
  id: string;
  siswaId: string;
  jenis: JenisDokumen;
  fileUrl: string;
  namaFile?: string | null;
  uploadedAt: string;
}

// ── Siswa with relations ───────────────────────────────────────────────────────
export interface SiswaWithRelations extends Siswa {
  orangTua?: OrangTua | null;
  kelompokUmur?: { id: string; nama: string } | null;
  posisi?: { id: string; kode: string; nama: string } | null;
}
