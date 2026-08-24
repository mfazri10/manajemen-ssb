# 🗺️ Roadmap & Checklist Pengembangan — Manajemen SSB

> Review `ANALISIS-PROJECT.md` + `database/schema.sql`. Berisi review singkat, urutan prioritas pengerjaan, checklist fitur (ganti `- [ ]` jadi `- [x]` saat selesai), dan keputusan teknis untuk gap sebelum coding.

## 📋 Review Singkat

**Sudah kuat:** analisis masalah & studi literatur lengkap, studi kompetitor matang (Kita Juara, GRIIS, Bolasoft), schema database sangat komprehensif, tahapan pengembangan (Fase 1–5) jelas.

**Gap yang sudah diputuskan (lihat bagian Keputusan Teknis):** tech stack, multi-tenant/RLS, tabel `inventaris`, scheduler SPP.

## 🎯 Urutan Prioritas (kerjakan dari atas)

1. Fondasi: Setup, Auth, Multi-tenant, Master Data
2. Siswa, Orang Tua, Pelatih
3. Jadwal Latihan & Absensi
4. Dashboard ringkasan
5. Keuangan (SPP, Kas, Tabungan)
6. Evaluasi, Tes Fisik, Rapor
7. Pendaftaran Online & Komunikasi
8. Turnamen, Match, Klasemen, Inventaris
9. Scale & Monetisasi

## ✅ Checklist Fitur

### 🏗️ Fase 0 — Fondasi Teknis
- [x] Tentukan & setup tech stack (frontend, backend, DB)
- [x] Setup repository, env, linting, CI dasar
- [x] Jalankan `database/schema.sql` ke PostgreSQL
- [x] Jalankan `database/seed.sql` (data awal)
- [x] Koneksi DB + migration tool (Prisma/Drizzle/Eloquent)
- [x] Auth: register, login, logout, reset password
- [x] RBAC: role superadmin / admin / pelatih / orang_tua
- [x] Multi-tenant: scoping query per `akademi_id` (+ Row-Level Security)
- [x] Middleware proteksi route per role
- [x] Layout dasar (sidebar, header, navigasi)

### 🧩 Fase 0.5 — Master Data
- [x] CRUD Akademi (profil, logo, paket)
- [x] CRUD Kelompok Umur (U-6 s/d U-18)
- [x] CRUD Master Posisi (GK, DF, MF, FW)
- [x] CRUD Master Pelanggaran
- [x] Manajemen User (undang admin/pelatih)

### 🧑‍🎓 Fase 1 — MVP Operasional
**Manajemen Siswa**
- [x] CRUD data siswa (NISN, NIK, profil lengkap, foto)
- [x] Data alamat (provinsi/kabupaten/kecamatan/desa)
- [x] Penempatan ke kelompok umur & posisi
- [x] Status siswa (aktif/alumni/nonaktif/pending)
- [x] Upload dokumen siswa (akta, KK, dll)
- [x] Detail & riwayat per siswa

**Orang Tua / Wali**
- [x] CRUD data orang tua (relasi 1:1 ke siswa)
- [x] Kontak ayah/ibu/wali

**Manajemen Pelatih**
- [x] CRUD data pelatih + foto
- [x] Lisensi pelatih (D Nasional, C/B/A/Pro AFC, dll)
- [x] Jabatan & penugasan ke kelompok umur

**Jadwal Latihan**
- [x] CRUD jadwal latihan per kelompok umur
- [x] Tampilan kalender
- [x] Lokasi & materi per sesi
- [x] Status jadwal (aktif/batal/selesai)

**Absensi Digital**
- [x] Input absensi siswa per sesi (hadir/izin/sakit/alpha)
- [x] Rekap harian/mingguan/bulanan
- [x] Export Excel/PDF
- [x] Alert siswa sering absen

**Dashboard**
- [x] Ringkasan total siswa, kehadiran, keuangan
- [x] Grafik tren kehadiran

### 💰 Fase 2 — Keuangan & Evaluasi
**Keuangan / SPP**
- [x] Generate tagihan SPP bulanan (scheduler)
- [x] Input pembayaran (tunai/transfer/QRIS) + upload bukti
- [x] Dukungan cicilan per tagihan
- [x] Status lunas/belum/dispensasi
- [x] Riwayat pembayaran per siswa
- [x] Buku Kas (pemasukan & pengeluaran)
- [x] Tabungan siswa (simpan/tarik)
- [x] Laporan keuangan bulanan/tahunan
- [x] Reminder tunggakan otomatis

**Evaluasi & Rapor**
- [x] Evaluasi per aspek (teknik, fisik, taktik, mental)
- [x] Catatan pelatih per siswa
- [x] Tes fisik (jenis tes, nilai, satuan)
- [x] Rapor per semester + grafik perkembangan
- [x] Export rapor ke PDF
- [x] Pencatatan pelanggaran siswa

### 📝 Fase 3 — Pendaftaran & Komunikasi
- [x] Form pendaftaran online (link/QR shareable)
- [x] Upload dokumen saat daftar
- [x] Verifikasi pendaftar oleh admin
- [x] Konfirmasi otomatis ke orang tua
- [x] Pembayaran registrasi
- [x] Pengumuman/broadcast (semua / per kelompok / per role)
- [x] Arsip pengumuman
- [x] Notifikasi in-app
- [x] Integrasi WhatsApp/Email (pilih provider)
- [x] Portal orang tua (pantau jadwal, absensi, SPP, rapor)

### 🏆 Fase 4 — Turnamen & Inventaris
- [x] CRUD turnamen yang diikuti
- [x] Pendaftaran peserta turnamen
- [x] Detail match (skor, babak, lokasi)
- [x] Lineup pemain per match
- [x] Match event (gol, assist, kartu)
- [x] Klasemen otomatis (`v_klasemen`)
- [x] Statistik & portofolio prestasi
- [x] Seleksi pemain (peserta, hasil lulus/tidak)
- [x] Manajemen materi latihan / kurikulum (Filanesia)
- [x] Log aktivitas pelatih
- [x] Manajemen inventaris (jersey, bola, dll)

### 🚀 Fase 5 — Scale & Monetisasi
- [x] Multi-akademi penuh (onboarding mandiri + subdomain/slug)
- [x] Super admin / dashboard asosiasi (monitoring antar SSB)
- [x] Sistem langganan (gratis/starter/growth/pro)
- [x] Integrasi payment gateway untuk langganan
- [x] Batasan fitur per paket (feature gating)
- [x] API publik untuk integrasi pihak ketiga
- [x] Mobile app (PWA / native)
- [x] Audit log & backup otomatis

---

## 🛠️ Keputusan Teknis untuk Gap Sebelum Coding

### 1. Tech Stack (Rekomendasi Final)

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui | SSR, cepat, cocok untuk dashboard admin |
| Backend/API | NestJS (REST) + TypeScript | Modular, RBAC & validasi rapi |
| Database | PostgreSQL (via Supabase) | Schema sudah PostgreSQL, Supabase punya RLS + Auth + Storage |
| ORM | Prisma atau Drizzle | Type-safe, migration management |
| Auth | Supabase Auth / Better Auth + JWT | Terintegrasi RLS, multi-role |
| Storage | Supabase Storage / S3 | Foto siswa, dokumen, bukti bayar |
| Scheduler | node-cron / BullMQ / Supabase pg_cron | Generate tagihan SPP & reminder |
| Notifikasi | Fonnte/Wablas (WA) + Resend/SMTP (email) | Kanal utama komunikasi orang tua |
| Payment | Midtrans / Xendit | QRIS, VA, e-wallet — SPP & langganan |
| Hosting | Vercel (web) + Railway/VPS (API) + Supabase (DB) | Deploy cepat, scalable |

### 2. Strategi Multi-Tenant & Row-Level Security (RLS)

**Pendekatan:** *Shared database, shared schema* dengan kolom `akademi_id` di setiap tabel + PostgreSQL RLS untuk isolasi data antar akademi.

**Prinsip:**
- Setiap request membawa identitas user → diambil `akademi_id`.
- RLS policy memastikan user hanya akses baris dengan `akademi_id` miliknya.
- `superadmin` (asosiasi) bisa bypass untuk monitoring lintas akademi.

```sql
-- Aktifkan RLS pada tabel
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya melihat data akademinya sendiri
CREATE POLICY tenant_isolation_siswa ON siswa
  USING (akademi_id = (auth.jwt() ->> 'akademi_id')::uuid);

-- Policy khusus superadmin (bypass)
CREATE POLICY superadmin_all_siswa ON siswa
  USING ((auth.jwt() ->> 'role') = 'superadmin');
```

> Ulangi `ENABLE ROW LEVEL SECURITY` + policy untuk semua tabel ber-`akademi_id`. Untuk tabel anak (mis. `orang_tua`, `absensi`, `spp_pembayaran`) yang tidak punya `akademi_id` langsung, buat policy via JOIN/subquery ke tabel induknya.

Alternatif tanpa Supabase Auth (set tenant context per koneksi):

```sql
-- Di awal tiap request (middleware backend)
SET app.current_akademi = '<akademi_id>';

CREATE POLICY tenant_isolation_siswa ON siswa
  USING (akademi_id = current_setting('app.current_akademi')::uuid);
```

### 3. Tabel `inventaris` (Tambahan untuk `database/schema.sql`)

```sql
-- ============================================
-- INVENTARIS & PERLENGKAPAN
-- ============================================

-- Inventaris (master barang per akademi)
CREATE TABLE inventaris (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) CHECK (kategori IN ('jersey','bola','cone','rompi','gawang','medis','lainnya')),
    jumlah INT NOT NULL DEFAULT 0,
    satuan VARCHAR(20) DEFAULT 'pcs',
    kondisi VARCHAR(20) DEFAULT 'baik' CHECK (kondisi IN ('baik','rusak_ringan','rusak_berat')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distribusi inventaris (mis. jersey ke siswa)
CREATE TABLE inventaris_distribusi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventaris_id UUID NOT NULL REFERENCES inventaris(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE SET NULL,
    jumlah INT NOT NULL DEFAULT 1,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'dipinjam' CHECK (status IN ('dipinjam','dikembalikan','hilang','milik')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mutasi stok (pengadaan/pengurangan)
CREATE TABLE inventaris_mutasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventaris_id UUID NOT NULL REFERENCES inventaris(id) ON DELETE CASCADE,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('masuk','keluar')),
    jumlah INT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_inventaris_akademi ON inventaris(akademi_id);
CREATE INDEX idx_inv_distribusi_inventaris ON inventaris_distribusi(inventaris_id);
CREATE INDEX idx_inv_distribusi_siswa ON inventaris_distribusi(siswa_id);
CREATE INDEX idx_inv_mutasi_inventaris ON inventaris_mutasi(inventaris_id);
```

### 4. Scheduler Otomatis untuk SPP

**Tujuan:** otomatis membuat `spp_tagihan` untuk semua siswa aktif tiap awal bulan + kirim reminder tunggakan.

**Opsi A — Database-native (Supabase pg_cron):**

```sql
-- Jalankan tiap tanggal 1 pukul 00:05
SELECT cron.schedule(
  'generate-spp-bulanan',
  '5 0 1 * *',
  $$
    INSERT INTO spp_tagihan (siswa_id, bulan, tahun, jumlah, status, jatuh_tempo)
    SELECT s.id,
           EXTRACT(MONTH FROM CURRENT_DATE)::int,
           EXTRACT(YEAR FROM CURRENT_DATE)::int,
           150000, -- TODO: ambil dari setting paket/akademi
           'belum',
           (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date
    FROM siswa s
    WHERE s.status = 'aktif'
    ON CONFLICT (siswa_id, bulan, tahun) DO NOTHING;
  $$
);
```

**Opsi B — Application-level (NestJS @Cron / node-cron / BullMQ):**

```typescript
@Cron('5 0 1 * *') // tiap tanggal 1, 00:05
async generateMonthlySpp() {
  const siswaAktif = await this.siswaService.findActive();
  for (const s of siswaAktif) {
    await this.sppService.createTagihanIfNotExists({
      siswaId: s.id,
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      jumlah: s.akademi.sppDefault,
    });
  }
}

// Reminder tunggakan — tiap hari pukul 08:00
@Cron('0 8 * * *')
async remindOverdue() {
  const overdue = await this.sppService.findOverdue();
  for (const t of overdue) {
    await this.notifService.sendWa(t.siswa.orangTua.hp, reminderTemplate(t));
  }
}
```

**Checklist implementasi scheduler:**
- [ ] Tentukan sumber nominal SPP (per akademi / per kelompok umur)
- [ ] Pilih mekanisme scheduler (pg_cron vs app-level)
- [ ] Job generate tagihan bulanan (idempotent via `ON CONFLICT`)
- [ ] Job reminder tunggakan (H-3 jatuh tempo & saat lewat tempo)
- [ ] Logging & retry bila job gagal

---

## 📌 Catatan Teknis Tambahan
- [ ] Tambah kolom `deleted_at` (soft delete) untuk tabel penting
- [ ] Tambah kolom `created_by` / `updated_by` untuk audit
- [ ] Terapkan RLS berbasis `akademi_id` di semua tabel
- [ ] Setup scheduler untuk generate tagihan SPP & reminder
