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
- [ ] Tentukan & setup tech stack (frontend, backend, DB)
- [ ] Setup repository, env, linting, CI dasar
- [ ] Jalankan `database/schema.sql` ke PostgreSQL
- [ ] Jalankan `database/seed.sql` (data awal)
- [ ] Koneksi DB + migration tool (Prisma/Drizzle/Eloquent)
- [ ] Auth: register, login, logout, reset password
- [ ] RBAC: role superadmin / admin / pelatih / orang_tua
- [ ] Multi-tenant: scoping query per `akademi_id` (+ Row-Level Security)
- [ ] Middleware proteksi route per role
- [ ] Layout dasar (sidebar, header, navigasi)

### 🧩 Fase 0.5 — Master Data
- [ ] CRUD Akademi (profil, logo, paket)
- [ ] CRUD Kelompok Umur (U-6 s/d U-18)
- [ ] CRUD Master Posisi (GK, DF, MF, FW)
- [ ] CRUD Master Pelanggaran
- [ ] Manajemen User (undang admin/pelatih)

### 🧑‍🎓 Fase 1 — MVP Operasional
**Manajemen Siswa**
- [ ] CRUD data siswa (NISN, NIK, profil lengkap, foto)
- [ ] Data alamat (provinsi/kabupaten/kecamatan/desa)
- [ ] Penempatan ke kelompok umur & posisi
- [ ] Status siswa (aktif/alumni/nonaktif/pending)
- [ ] Upload dokumen siswa (akta, KK, dll)
- [ ] Detail & riwayat per siswa

**Orang Tua / Wali**
- [ ] CRUD data orang tua (relasi 1:1 ke siswa)
- [ ] Kontak ayah/ibu/wali

**Manajemen Pelatih**
- [ ] CRUD data pelatih + foto
- [ ] Lisensi pelatih (D Nasional, C/B/A/Pro AFC, dll)
- [ ] Jabatan & penugasan ke kelompok umur

**Jadwal Latihan**
- [ ] CRUD jadwal latihan per kelompok umur
- [ ] Tampilan kalender
- [ ] Lokasi & materi per sesi
- [ ] Status jadwal (aktif/batal/selesai)

**Absensi Digital**
- [ ] Input absensi siswa per sesi (hadir/izin/sakit/alpha)
- [ ] Rekap harian/mingguan/bulanan
- [ ] Export Excel/PDF
- [ ] Alert siswa sering absen

**Dashboard**
- [ ] Ringkasan total siswa, kehadiran, keuangan
- [ ] Grafik tren kehadiran

### 💰 Fase 2 — Keuangan & Evaluasi
**Keuangan / SPP**
- [ ] Generate tagihan SPP bulanan (scheduler)
- [ ] Input pembayaran (tunai/transfer/QRIS) + upload bukti
- [ ] Dukungan cicilan per tagihan
- [ ] Status lunas/belum/dispensasi
- [ ] Riwayat pembayaran per siswa
- [ ] Buku Kas (pemasukan & pengeluaran)
- [ ] Tabungan siswa (simpan/tarik)
- [ ] Laporan keuangan bulanan/tahunan
- [ ] Reminder tunggakan otomatis

**Evaluasi & Rapor**
- [ ] Evaluasi per aspek (teknik, fisik, taktik, mental)
- [ ] Catatan pelatih per siswa
- [ ] Tes fisik (jenis tes, nilai, satuan)
- [ ] Rapor per semester + grafik perkembangan
- [ ] Export rapor ke PDF
- [ ] Pencatatan pelanggaran siswa

### 📝 Fase 3 — Pendaftaran & Komunikasi
- [ ] Form pendaftaran online (link/QR shareable)
- [ ] Upload dokumen saat daftar
- [ ] Verifikasi pendaftar oleh admin
- [ ] Konfirmasi otomatis ke orang tua
- [ ] Pembayaran registrasi
- [ ] Pengumuman/broadcast (semua / per kelompok / per role)
- [ ] Arsip pengumuman
- [ ] Notifikasi in-app
- [ ] Integrasi WhatsApp/Email (pilih provider)
- [ ] Portal orang tua (pantau jadwal, absensi, SPP, rapor)

### 🏆 Fase 4 — Turnamen & Inventaris
- [ ] CRUD turnamen yang diikuti
- [ ] Pendaftaran peserta turnamen
- [ ] Detail match (skor, babak, lokasi)
- [ ] Lineup pemain per match
- [ ] Match event (gol, assist, kartu)
- [ ] Klasemen otomatis (`v_klasemen`)
- [ ] Statistik & portofolio prestasi
- [ ] Seleksi pemain (peserta, hasil lulus/tidak)
- [ ] Manajemen materi latihan / kurikulum (Filanesia)
- [ ] Log aktivitas pelatih
- [ ] Manajemen inventaris (jersey, bola, dll)

### 🚀 Fase 5 — Scale & Monetisasi
- [ ] Multi-akademi penuh (onboarding mandiri + subdomain/slug)
- [ ] Super admin / dashboard asosiasi (monitoring antar SSB)
- [ ] Sistem langganan (gratis/starter/growth/pro)
- [ ] Integrasi payment gateway untuk langganan
- [ ] Batasan fitur per paket (feature gating)
- [ ] API publik untuk integrasi pihak ketiga
- [ ] Mobile app (PWA / native)
- [ ] Audit log & backup otomatis

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
