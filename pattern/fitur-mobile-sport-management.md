# 📱 Fitur-Fitur Mobile SaaS Sport Management
> Analisis Lengkap Aplikasi Expo / React Native

**Proyek:** `sport-mobile`
**Framework:** Expo (React Native) · TypeScript
**Backend:** NestJS + GraphQL (Apollo)
**Versi:** 1.0.0

---

## Daftar Isi

1. [Autentikasi & Keamanan](#1-autentikasi--keamanan)
2. [Dashboard Utama (Beranda)](#2-dashboard-utama-beranda)
3. [Manajemen Siswa](#3-manajemen-siswa)
4. [Jadwal Latihan](#4-jadwal-latihan)
5. [Absensi Digital](#5-absensi-digital)
6. [Evaluasi & Raport](#6-evaluasi--raport)
7. [Tes Fisik](#7-tes-fisik)
8. [Keuangan & SPP](#8-keuangan--spp)
9. [Turnamen & Pertandingan](#9-turnamen--pertandingan)
10. [Pengumuman & Komunikasi](#10-pengumuman--komunikasi)
11. [Materi Latihan](#11-materi-latihan)
12. [Profil & Pengaturan](#12-profil--pengaturan)
13. [Notifikasi Push](#13-notifikasi-push)

---

## 1. Autentikasi & Keamanan

📁 `apps/mobile/sport-mobile/app/(auth)/`

### Sub-fitur

| Fitur | File | Keterangan |
|---|---|---|
| Halaman Selamat Datang | `welcome.tsx` | Landing page sebelum login/register |
| Login | `login.tsx` | Login email & password via Better Auth |
| Registrasi | `register.tsx` | Daftar akun baru + buat/join akademi |
| Lupa Password | `forgot-password.tsx` | Reset password via email |

---

## 2. Dashboard Utama (Beranda)

📁 `apps/mobile/sport-mobile/app/(tabs)/index.tsx`

Dashboard **adaptif** yang berubah tampilannya berdasarkan role pengguna.

### Komponen Dashboard

| Komponen | Keterangan |
|---|---|
| **Header Salam** | Menampilkan nama user, nama akademi, dan badge role |
| **Statistik Ringkas** | Total siswa aktif, pelatih aktif, absensi hari ini, SPP belum lunas |
| **Jadwal Hari Ini** | Daftar jadwal latihan hari ini dengan waktu & lokasi |
| **Pengumuman Terbaru** | 3 pengumuman terbaru |
| **Aksi Cepat** | Grid tombol shortcut (berbeda per role) |

### Dashboard per Role

| Role | Konten Dashboard |
|---|---|
| **Admin** | Statistik lengkap (siswa, pelatih, keuangan), grafik kehadiran, jadwal hari ini |
| **Pelatih** | Jadwal hari ini, absensi cepat, evaluasi pending, log kegiatan |
| **Orang Tua** | Profil anak, kehadiran anak, SPP status, rapor terbaru, pengumuman |

---

## 3. Manajemen Siswa

📁 `apps/mobile/sport-mobile/app/siswa/`

### Sub-fitur

| Fitur | File | Keterangan |
|---|---|---|
| Daftar Siswa | `index.tsx` | List siswa dengan search & filter (KU, status, posisi) |
| Detail Siswa | `[siswaId].tsx` | Profil lengkap siswa + data orang tua |
| Tambah Siswa | `tambah.tsx` | Form tambah siswa (27 field) |
| Edit Siswa | `edit/[siswaId].tsx` | Form edit siswa |

### Data Siswa yang Dikelola

- Profil lengkap (foto, NIK, NISN, nama, tempat/tgl lahir, alamat)
- Data orang tua/wali (nama, no. HP, email)
- Posisi bermain (GK, DF, MF, FW + custom)
- Kelompok umur (U-6 s/d U-18, auto-hitung dari tanggal lahir)
- Status (aktif, alumni, non-aktif, pending)
- Riwayat klub sebelumnya
- Dokumen (akta lahir, KK, surat sehat)
- Tinggi & berat badan

---

## 4. Jadwal Latihan

📁 `apps/mobile/sport-mobile/app/(tabs)/jadwal.tsx`

### Fitur

- Kalender latihan per kelompok umur
- Hari, waktu mulai/selesai, lokasi
- Materi latihan per sesi
- Status (aktif, batal, selesai)
- Filter per kelompok umur
- Tambah/edit/hapus jadwal (admin/pelatih)
- Notifikasi otomatis ke siswa/orang tua

---

## 5. Absensi Digital

📁 `apps/mobile/sport-mobile/app/(tabs)/absensi.tsx`

### Fitur

- **Absensi batch** — input kehadiran semua siswa dalam satu sesi
- **4 status:** Hadir ✅ · Izin 🟡 · Sakit 🔵 · Alpha 🔴
- Input per jadwal latihan
- Catatan keterangan per siswa
- Rekap kehadiran (harian, mingguan, bulanan)
- Persentase kehadiran per siswa
- Alert jika siswa sering tidak hadir
- Export ke PDF/Excel (admin)
- Notifikasi ke orang tua setelah absensi disimpan

### Alur Pelatih — Input Absensi

```
Login → Dashboard → Pilih Jadwal Hari Ini → Pilih Kelompok Umur
→ List Siswa → Tap Hadir/Izin/Sakit/Alpha per siswa → Simpan
→ Notifikasi ke Orang Tua: "Anak Anda hadir latihan hari ini"
```

---

## 6. Evaluasi & Raport

📁 `apps/mobile/sport-mobile/app/evaluasi/`

### Penilaian per Aspek (Skala 0-100)

| Aspek | Komponen |
|---|---|
| **Teknik** | Passing, dribbling, shooting, heading, tackling |
| **Fisik** | Kecepatan, stamina, kelincahan, kekuatan |
| **Taktik** | Positioning, game reading, decision making |
| **Mental** | Disiplin, kerjasama, sportivitas, leadership |

### Fitur

- Input evaluasi per siswa per semester
- Catatan personal dari pelatih
- Radar chart visual (4 dimensi)
- Progress tracking (grafik perkembangan dari semester ke semester)
- Export rapor ke PDF
- Riwayat evaluasi per siswa
- Filter per semester & tahun ajaran

---

## 7. Tes Fisik

📁 `apps/mobile/sport-mobile/app/tes-fisik/`

### Tab

| Tab | Keterangan |
|---|---|
| **Input** | Form input hasil tes fisik |
| **Hasil** | Data hasil tes per siswa |
| **Ranking** | Perankingan pemain per jenis tes |
| **Grafik** | Visualisasi data tes fisik |
| **Pedoman** | Panduan pelaksanaan tes fisik |

### Field Input

- Tanggal tes (default: hari ini)
- Kelompok umur
- Siswa
- Jenis tes (sprint, lari jarak jauh, push-up, sit-up, dll.)
- Nilai + satuan
- Catatan opsional

---

## 8. Keuangan & SPP

📁 `apps/mobile/sport-mobile/app/keuangan/`

### Sub-fitur

| Sub-fitur | Keterangan |
|---|---|
| **SPP Siswa** | Tagihan per bulan, status (lunas/belum/dispensasi), riwayat pembayaran |
| **Buku Kas** | Catatan kas masuk & keluar akademi |
| **Tabungan** | Simpan/tarik tabungan per siswa |
| **Dispensasi** | Keringanan SPP untuk siswa tertentu |

### Detail SPP

- Tagihan otomatis per bulan per siswa
- Pembayaran bisa dicicil (1 tagihan → banyak pembayaran)
- Metode: tunai, transfer, QRIS, lainnya
- Upload bukti pembayaran
- Reminder otomatis untuk tunggakan
- Export laporan ke PDF/Excel

---

## 9. Turnamen & Pertandingan

📁 `apps/mobile/sport-mobile/app/turnamen/`

### Sub-fitur

| Sub-fitur | Keterangan |
|---|---|
| **Daftar Turnamen** | List turnamen yang diikuti akademi |
| **Detail Turnamen** | Info turnamen + daftar pertandingan |
| **Pertandingan (Match)** | Detail per pertandingan: lineup, skor, event |
| **Klasemen** | Tabel klasemen otomatis dari hasil pertandingan |
| **Statistik Pemain** | Gol, assist, kartu kuning/merah per siswa |

### Detail Match

- Susunan pemain (starter + cadangan)
- Pergantian pemain (substitusi)
- Event: gol, assist, kartu kuning, kartu merah, own goal
- Skor akhir
- Status: belum, berlangsung, selesai, batal

---

## 10. Pengumuman & Komunikasi

📁 `apps/mobile/sport-mobile/app/pengumuman/`

### Fitur

- Buat pengumuman (admin/pelatih)
- Target: semua, per kelompok umur, per role (siswa/orang tua/pelatih)
- Arsip pengumuman
- Search & filter
- Notifikasi push otomatis ke target

---

## 11. Materi Latihan

📁 `apps/mobile/sport-mobile/app/materi/`

### Fitur

- **Kategori materi** (Teknik, Fisik, Taktik, Mental, Permainan)
- **Per kelompok umur** — materi disesuaikan tahapan usia
- **Level:** Pemula, Menengah, Lanjutan
- Instruksi detail per materi
- Durasi (menit)
- Integrasi dengan **kurikulum Filanesia PSSI**

---

## 12. Profil & Pengaturan

📁 `apps/mobile/sport-mobile/app/(tabs)/profile.tsx`

### Profil Akademi

- Nama akademi, logo, alamat, kontak
- Paket langganan (gratis/starter/growth/pro)
- Edit profil akademi (admin)

### Manajemen Anggota

- Daftar anggota (admin, pelatih, orang tua)
- Undang anggota baru
- Hapus anggota
- Atur role per anggota

### Pengaturan

| Pengaturan | Keterangan |
|---|---|
| Edit Profil | Ubah nama, foto, password |
| Notifikasi | Toggle notifikasi push |
| Bahasa | Pilih bahasa (id/en) |

---

## 13. Notifikasi Push

### Tipe Notifikasi

| Tipe | Contoh |
|---|---|
| `jadwal` | "Latihan hari ini jam 16:00 di Lapangan A" |
| `absensi` | "Anak Anda hadir latihan hari ini" |
| `spp` | "Tagihan SPP bulan Juni sudah tersedia" |
| `pengumuman` | "Pengumuman: Libur latihan minggu depan" |
| `turnamen` | "Turnamen dimulai besok, pastikan anak Anda siap" |
| `evaluasi` | "Rapor semester 1 sudah tersedia" |

---

## Arsitektur & Stack Teknis

```
sport-mobile/
├── app/                    # Routing Expo Router (file-based)
│   ├── (auth)/             # Auth flow (welcome, login, register)
│   ├── (tabs)/             # Tab navigation utama
│   ├── siswa/              # Fitur manajemen siswa
│   ├── evaluasi/           # Fitur evaluasi/rapor
│   ├── keuangan/           # Fitur keuangan
│   ├── turnamen/           # Fitur turnamen
│   └── pengumuman/         # Fitur pengumuman
├── features/               # Feature modules (Feature-Sliced)
│   ├── siswa/
│   ├── pelatih/
│   ├── jadwal/
│   ├── absensi/
│   ├── keuangan/
│   ├── evaluasi/
│   ├── tes-fisik/
│   ├── turnamen/
│   ├── pengumuman/
│   ├── materi/
│   └── dashboard/
├── components/ui/          # Design system global
├── context/
│   └── AppContext.tsx       # Global state (user, akademi aktif)
├── constants/
│   └── theme.ts            # Token desain
├── types/
│   └── index.ts            # Global TypeScript types
└── utils/
    ├── storage.ts          # AsyncStorage helpers
    ├── date.ts             # Format tanggal
    └── format.ts           # Format currency
```

### Dependensi Utama

| Library | Kegunaan |
|---|---|
| `expo-router` | File-based routing |
| `@apollo/client` | GraphQL client |
| `react-native-svg` | Grafik evaluasi (radar chart) |
| `react-native-reanimated` | Animasi |
| `expo-image-picker` | Upload foto siswa/pelatih |
| `@react-native-community/datetimepicker` | Picker tanggal & waktu |
| `react-native-safe-area-context` | Safe area insets |

---

## Fase Pengembangan Mobile

| Fase | Fitur | Prioritas |
|---|---|---|
| **Fase 1 (MVP)** | Login, Dashboard, Siswa CRUD, Jadwal, Absensi | P0 |
| **Fase 2** | SPP/Keuangan, Evaluasi/Rapor, Tes Fisik | P1 |
| **Fase 3** | Pengumuman, Notifikasi Push, Portal Orang Tua | P1 |
| **Fase 4** | Turnamen, Match, Klasemen, Materi Latihan | P2 |

---

*Dokumen ini dibuat berdasarkan analisis kebutuhan SaaS Sport Management pada 27 Juni 2026.*
