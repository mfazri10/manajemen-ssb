# 🗄️ ERD Database SaaS Sport Management

> Entity Relationship Diagram — Desain Database PostgreSQL (Self-Hosted)

**Database:** PostgreSQL (Self-Hosted)
**Auth Provider:** Better Auth
**Versi Dokumen:** 1.0.0 — 27 Juni 2026

> [!NOTE]
> Dokumen ini mendeskripsikan desain database untuk platform manajemen Sekolah Sepak Bola (SSB) berbasis SaaS multi-tenant.

---

## Daftar Isi

1. [Diagram ERD (Mermaid)](#1-diagram-erd-mermaid)
2. [Deskripsi Tabel](#2-deskripsi-tabel)
3. [Relasi Antar Tabel](#3-relasi-antar-tabel)
4. [Catatan Implementasi](#4-catatan-implementasi)

---

## 1. Diagram ERD (Mermaid)

```mermaid
erDiagram

    %% ── BETTER AUTH CORE ────────────────────────────────────────────
    USERS {
        text    id              PK
        text    name
        text    email           UK
        boolean email_verified
        text    image
        timestamp created_at
        timestamp updated_at
    }

    SESSIONS {
        text    id              PK
        text    user_id         FK
        text    token           UK
        timestamp expires_at
        text    ip_address
        text    user_agent
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNTS {
        text    id              PK
        text    user_id         FK
        text    account_id
        text    provider_id
        text    access_token
        text    refresh_token
        text    password
        timestamp created_at
        timestamp updated_at
    }

    VERIFICATIONS {
        text    id              PK
        text    identifier
        text    value
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    %% ── MULTI-TENANT (AKADEMI) ─────────────────────────────────────
    AKADEMI {
        uuid    id              PK
        text    nama_akademi
        text    slug            UK
        text    logo_url
        text    alamat
        text    no_hp
        text    email
        text    website
        text    paket           "gratis | starter | growth | pro"
        timestamp created_at
        timestamp updated_at
    }

    %% ── RBAC (Role-Based Access Control) ───────────────────────────
    ROLES {
        int     id              PK
        text    name            UK
        text    label
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        int     id              PK
        text    name            UK
        text    label
        timestamp created_at
        timestamp updated_at
    }

    ROLE_USERS {
        int     id              PK
        text    user_id         FK
        int     role_id         FK
        uuid    akademi_id      FK
    }

    PERMISSION_ROLES {
        int     id              PK
        int     permission_id   FK
        int     role_id         FK
    }

    %% ── MASTER DATA ────────────────────────────────────────────────
    KELOMPOK_UMUR {
        uuid    id              PK
        uuid    akademi_id      FK
        text    nama            "U-6, U-8, U-10, U-12, U-14, U-16, U-18"
        int     usia_min
        int     usia_max
        timestamp created_at
    }

    MASTER_POSISI {
        uuid    id              PK
        uuid    akademi_id      FK
        text    kode            "GK, CB, LB, RB, DMF, CMF, AMF, LW, RW, CF"
        text    nama
        timestamp created_at
    }

    MASTER_PELANGGARAN {
        uuid    id              PK
        uuid    akademi_id      FK
        text    nama
        int     poin
        timestamp created_at
    }

    %% ── SISWA & ORANG TUA ──────────────────────────────────────────
    SISWA {
        uuid    id              PK
        uuid    akademi_id      FK
        uuid    kelompok_umur_id FK
        text    nisn
        text    nik
        text    nama_lengkap
        text    nama_panggilan
        text    tempat_lahir
        date    tanggal_lahir
        text    jenis_kelamin   "L | P"
        text    agama
        uuid    posisi_id       FK
        numeric tinggi_badan
        numeric berat_badan
        text    foto_url
        text    status          "aktif | alumni | nonaktif | pending"
        text    klub_sebelumnya
        text    provinsi
        text    kabupaten
        text    kecamatan
        text    desa
        text    alamat_lengkap
        text    catatan
        timestamp created_at
        timestamp updated_at
    }

    ORANG_TUA {
        uuid    id              PK
        uuid    siswa_id        FK UK
        text    nama_orang_tua
        text    hp_orang_tua
        text    hp_ayah
        text    hp_ibu
        text    email
        text    hubungan
        timestamp created_at
    }

    DOKUMEN_SISWA {
        uuid    id              PK
        uuid    siswa_id        FK
        text    jenis           "akta | kk | nisn | kartu_pelajar | raport"
        text    file_url
        text    nama_file
        timestamp uploaded_at
    }

    %% ── PELATIH ────────────────────────────────────────────────────
    PELATIH {
        uuid    id              PK
        uuid    akademi_id      FK
        text    nama_lengkap
        text    no_hp
        text    email
        text    tempat_lahir
        date    tanggal_lahir
        text    foto_url
        text    status          "aktif | nonaktif"
        text    provinsi
        text    kabupaten
        text    kecamatan
        text    desa
        text    catatan
        timestamp created_at
        timestamp updated_at
    }

    PELATIH_LISENSI {
        uuid    id              PK
        uuid    pelatih_id      FK
        text    lisensi         "d_nasional | c_afc | b_afc | a_afc | pro_afc | fisik | kiper | futsal"
        text    lisensi_lainnya
        timestamp created_at
    }

    PELATIH_JABATAN {
        uuid    id              PK
        uuid    pelatih_id      FK
        uuid    kelompok_umur_id FK
        text    jabatan         "pelatih_ku | pelatih_kiper | pelatih_fisik | asisten | kepala_pelatih | koordinator"
        timestamp created_at
    }

    %% ── JADWAL & ABSENSI ───────────────────────────────────────────
    JADWAL_LATIHAN {
        uuid    id              PK
        uuid    akademi_id      FK
        uuid    kelompok_umur_id FK
        text    hari
        time    waktu_mulai
        time    waktu_selesai
        text    lokasi
        text    materi
        date    tanggal
        text    status          "aktif | batal | selesai"
        timestamp created_at
    }

    ABSENSI {
        uuid    id              PK
        uuid    jadwal_id       FK
        uuid    siswa_id        FK
        date    tanggal
        text    status          "hadir | izin | sakit | alpha"
        text    keterangan
        timestamp created_at
    }

    %% ── KEUANGAN ───────────────────────────────────────────────────
    SPP_TAGIHAN {
        uuid    id              PK
        uuid    siswa_id        FK
        int     bulan
        int     tahun
        numeric jumlah
        text    status          "lunas | belum | dispensasi"
        date    jatuh_tempo
        timestamp created_at
    }

    SPP_PEMBAYARAN {
        uuid    id              PK
        uuid    tagihan_id      FK
        date    tanggal_bayar
        numeric jumlah
        text    metode          "tunai | transfer | qris | lainnya"
        text    bukti_url
        text    keterangan
        timestamp created_at
    }

    BUKU_KAS {
        uuid    id              PK
        uuid    akademi_id      FK
        date    tanggal
        text    tipe            "masuk | keluar"
        text    kategori
        numeric jumlah
        text    keterangan
        timestamp created_at
    }

    TABUNGAN {
        uuid    id              PK
        uuid    siswa_id        FK
        date    tanggal
        text    tipe            "simpan | tarik"
        numeric jumlah
        text    keterangan
        timestamp created_at
    }

    %% ── EVALUASI & PENILAIAN ───────────────────────────────────────
    TES_FISIK {
        uuid    id              PK
        uuid    siswa_id        FK
        uuid    kelompok_umur_id FK
        date    tanggal
        text    jenis_tes
        numeric nilai
        text    satuan
        text    catatan
        timestamp created_at
    }

    EVALUASI {
        uuid    id              PK
        uuid    siswa_id        FK
        uuid    pelatih_id      FK
        text    semester
        text    tahun_ajaran
        int     teknik          "0-100"
        int     fisik           "0-100"
        int     taktik          "0-100"
        int     mental          "0-100"
        text    catatan_pelatih
        timestamp created_at
    }

    SELEKSI {
        uuid    id              PK
        uuid    akademi_id      FK
        text    nama
        date    tanggal
        text    lokasi
        text    keterangan
        timestamp created_at
    }

    SELEKSI_PESERTA {
        uuid    id              PK
        uuid    seleksi_id      FK
        uuid    siswa_id        FK
        text    status          "daftar | lulus | tidak_lulus"
        numeric nilai
        text    catatan
        timestamp created_at
    }

    PELANGGARAN {
        uuid    id              PK
        uuid    siswa_id        FK
        uuid    master_pelanggaran_id FK
        date    tanggal
        text    keterangan
        timestamp created_at
    }

    %% ── KOMUNIKASI & TURNAMEN ──────────────────────────────────────
    PENGUMUMAN {
        uuid    id              PK
        uuid    akademi_id      FK
        text    judul
        text    isi
        text    target          "semua | siswa | orang_tua | pelatih"
        uuid    kelompok_umur_id FK
        date    tanggal
        timestamp created_at
    }

    TURNAMEN {
        uuid    id              PK
        uuid    akademi_id      FK
        text    nama
        date    tanggal_mulai
        date    tanggal_selesai
        text    lokasi
        text    kategori_umur
        text    hasil
        timestamp created_at
    }

    TURNAMEN_PESERTA {
        uuid    id              PK
        uuid    turnamen_id     FK
        uuid    siswa_id        FK
        text    posisi
        int     gol
        int     kartu_kuning
        int     kartu_merah
        int     menit_bermain
        text    catatan
        timestamp created_at
    }

    %% ── MATCH / PERTANDINGAN ───────────────────────────────────────
    MATCH {
        uuid    id              PK
        uuid    turnamen_id     FK
        text    babak           "penyisihan | perempat_final | semi_final | final | grup | friendly"
        int     match_no
        date    tanggal
        time    waktu
        text    lokasi
        text    tim_home
        text    tim_away
        int     skor_home
        int     skor_away
        text    status          "belum | berlangsung | selesai | batal"
        text    catatan
        timestamp created_at
    }

    MATCH_LINEUP {
        uuid    id              PK
        uuid    match_id        FK
        uuid    siswa_id        FK
        text    tim             "home | away"
        text    posisi
        text    status          "starter | cadangan | masuk | keluar"
        int     menit_masuk
        int     menit_keluar
        timestamp created_at
    }

    MATCH_EVENT {
        uuid    id              PK
        uuid    match_id        FK
        uuid    siswa_id        FK
        text    tipe            "gol | assist | kartu_kuning | kartu_merah | substitusi | own_goal"
        int     menit
        text    keterangan
        timestamp created_at
    }

    %% ── MATERI LATIHAN ─────────────────────────────────────────────
    MATERI_KATEGORI {
        uuid    id              PK
        uuid    akademi_id      FK
        text    nama
        int     urutan
        timestamp created_at
    }

    MATERI_LATIHAN {
        uuid    id              PK
        uuid    akademi_id      FK
        uuid    kategori_id     FK
        uuid    kelompok_umur_id FK
        text    judul
        text    deskripsi
        int     durasi_menit
        text    level           "pemula | menengah | lanjutan"
        text    tipe            "teknik | fisik | taktik | mental | permainan"
        text    instruksi
        timestamp created_at
    }

    %% ── LOG PELATIH ────────────────────────────────────────────────
    LOG_PELATIH {
        uuid    id              PK
        uuid    pelatih_id      FK
        uuid    jadwal_id       FK
        date    tanggal
        text    kegiatan
        uuid    materi_id       FK
        text    catatan
        int     durasi_menit
        timestamp created_at
    }

    %% ── NOTIFIKASI ─────────────────────────────────────────────────
    NOTIFIKASI {
        uuid    id              PK
        uuid    akademi_id      FK
        uuid    penerima_id     FK
        text    judul
        text    isi
        text    tipe            "info | pengumuman | spp | jadwal | absensi | turnamen"
        text    target          "semua | siswa | orang_tua | pelatih | per_siswa"
        uuid    siswa_id        FK
        boolean is_read
        text    sent_via        "in_app | push | wa | email"
        timestamp created_at
    }

    %% ════════════════════════════════════════════════════
    %% RELASI
    %% ════════════════════════════════════════════════════

    %% Better Auth Core
    USERS              ||--o{ SESSIONS               : "memiliki"
    USERS              ||--o{ ACCOUNTS               : "memiliki"

    %% Multi-Tenant & RBAC
    AKADEMI            ||--o{ ROLE_USERS             : "memiliki anggota"
    USERS              ||--o{ ROLE_USERS             : "memiliki"
    ROLES              ||--o{ ROLE_USERS             : "diberikan kepada"
    ROLES              ||--o{ PERMISSION_ROLES       : "memiliki"
    PERMISSIONS        ||--o{ PERMISSION_ROLES       : "dimiliki"

    %% Master Data
    AKADEMI            ||--o{ KELOMPOK_UMUR          : "memiliki"
    AKADEMI            ||--o{ MASTER_POSISI          : "memiliki"
    AKADEMI            ||--o{ MASTER_PELANGGARAN     : "memiliki"

    %% Siswa & Orang Tua
    AKADEMI            ||--o{ SISWA                  : "memiliki"
    KELOMPOK_UMUR      ||--o{ SISWA                  : "tergabung dalam"
    MASTER_POSISI      ||--o{ SISWA                  : "bermain di"
    SISWA              ||--|| ORANG_TUA              : "memiliki"
    SISWA              ||--o{ DOKUMEN_SISWA          : "memiliki"

    %% Pelatih
    AKADEMI            ||--o{ PELATIH                : "memiliki"
    PELATIH            ||--o{ PELATIH_LISENSI        : "memiliki"
    PELATIH            ||--o{ PELATIH_JABATAN        : "memiliki"
    KELOMPOK_UMUR      ||--o{ PELATIH_JABATAN        : "ditugaskan ke"

    %% Jadwal & Absensi
    AKADEMI            ||--o{ JADWAL_LATIHAN         : "memiliki"
    KELOMPOK_UMUR      ||--o{ JADWAL_LATIHAN         : "untuk"
    JADWAL_LATIHAN     ||--o{ ABSENSI                : "dicatat"
    SISWA              ||--o{ ABSENSI                : "memiliki"

    %% Keuangan
    SISWA              ||--o{ SPP_TAGIHAN            : "ditagih"
    SPP_TAGIHAN        ||--o{ SPP_PEMBAYARAN         : "dibayar melalui"
    AKADEMI            ||--o{ BUKU_KAS               : "mencatat"
    SISWA              ||--o{ TABUNGAN               : "memiliki"

    %% Evaluasi
    SISWA              ||--o{ TES_FISIK              : "menjalani"
    SISWA              ||--o{ EVALUASI               : "dievaluasi"
    PELATIH            ||--o{ EVALUASI               : "menilai"
    AKADEMI            ||--o{ SELEKSI                : "menyelenggarakan"
    SELEKSI            ||--o{ SELEKSI_PESERTA        : "diikuti"
    SISWA              ||--o{ SELEKSI_PESERTA        : "mengikuti"
    SISWA              ||--o{ PELANGGARAN            : "melakukan"

    %% Komunikasi & Turnamen
    AKADEMI            ||--o{ PENGUMUMAN             : "menerbitkan"
    AKADEMI            ||--o{ TURNAMEN               : "menyelenggarakan"
    TURNAMEN           ||--o{ TURNAMEN_PESERTA       : "diikuti"
    SISWA              ||--o{ TURNAMEN_PESERTA       : "berpartisipasi"
    TURNAMEN           ||--o{ MATCH                  : "terdiri dari"
    MATCH              ||--o{ MATCH_LINEUP           : "memiliki"
    MATCH              ||--o{ MATCH_EVENT            : "memiliki"
    SISWA              ||--o{ MATCH_LINEUP           : "bermain"
    SISWA              ||--o{ MATCH_EVENT            : "terlibat"

    %% Materi
    AKADEMI            ||--o{ MATERI_KATEGORI        : "memiliki"
    AKADEMI            ||--o{ MATERI_LATIHAN         : "memiliki"
    MATERI_KATEGORI    ||--o{ MATERI_LATIHAN         : "mengelompokkan"

    %% Log & Notifikasi
    PELATIH            ||--o{ LOG_PELATIH            : "mencatat"
    JADWAL_LATIHAN     ||--o{ LOG_PELATIH            : "terkait"
    AKADEMI            ||--o{ NOTIFIKASI             : "mengirim"
    USERS              ||--o{ NOTIFIKASI             : "menerima"
```

---

## 2. Deskripsi Tabel

> Untuk deskripsi lengkap setiap tabel, merujuk ke file `database/schema.sql` yang merupakan _single source of truth_ untuk implementasi.

### Ringkasan Tabel

| Kategori | Jumlah Tabel | Tabel Utama |
|---|---|---|
| Auth (Better Auth) | 4 | `users`, `sessions`, `accounts`, `verifications` |
| Multi-Tenant | 1 | `akademi` |
| RBAC | 4 | `roles`, `permissions`, `role_users`, `permission_roles` |
| Master Data | 3 | `kelompok_umur`, `master_posisi`, `master_pelanggaran` |
| Siswa & Orang Tua | 3 | `siswa`, `orang_tua`, `dokumen_siswa` |
| Pelatih | 3 | `pelatih`, `pelatih_lisensi`, `pelatih_jabatan` |
| Jadwal & Absensi | 2 | `jadwal_latihan`, `absensi` |
| Keuangan | 4 | `spp_tagihan`, `spp_pembayaran`, `buku_kas`, `tabungan` |
| Evaluasi | 5 | `tes_fisik`, `evaluasi`, `seleksi`, `seleksi_peserta`, `pelanggaran` |
| Turnamen & Match | 5 | `turnamen`, `turnamen_peserta`, `match`, `match_lineup`, `match_event` |
| Komunikasi | 2 | `pengumuman`, `notifikasi` |
| Materi | 2 | `materi_kategori`, `materi_latihan` |
| Log | 1 | `log_pelatih` |
| **Total** | **39** | |

---

## 3. Relasi Antar Tabel

```
akademi (Multi-tenant root) (1)
    ├── kelompok_umur (N)           → U-6 s/d U-18
    ├── master_posisi (N)           → GK, DF, MF, FW, dll
    ├── master_pelanggaran (N)      → Jenis pelanggaran
    ├── siswa (N)                   → Data pemain
    │    ├── orang_tua (1)          → One-to-one
    │    ├── dokumen_siswa (N)      → Akta, KK, dll
    │    ├── absensi (N)            → Per sesi latihan
    │    ├── spp_tagihan (N)        → Tagihan per bulan
    │    │    └── spp_pembayaran (N) → Cicilan pembayaran
    │    ├── tabungan (N)           → Simpan/tarik
    │    ├── tes_fisik (N)          → Hasil tes
    │    ├── evaluasi (N)           → Raport per semester
    │    ├── seleksi_peserta (N)    → Partisipasi seleksi
    │    ├── pelanggaran (N)        → Catatan pelanggaran
    │    ├── turnamen_peserta (N)   → Partisipasi turnamen
    │    ├── match_lineup (N)       → Susunan pemain
    │    └── match_event (N)        → Gol, kartu, assist
    │
    ├── pelatih (N)                 → Data pelatih
    │    ├── pelatih_lisensi (N)    → Multi-lisensi
    │    ├── pelatih_jabatan (N)    → Multi-jabatan
    │    ├── evaluasi (N)           → Menilai siswa
    │    └── log_pelatih (N)        → Aktivitas harian
    │
    ├── jadwal_latihan (N)          → Jadwal per KU
    │    ├── absensi (N)            → Absensi per jadwal
    │    └── log_pelatih (N)        → Log kegiatan
    │
    ├── buku_kas (N)               → Kas masuk/keluar
    ├── turnamen (N)               → Turnamen/liga
    │    ├── turnamen_peserta (N)   → Peserta
    │    └── match (N)              → Pertandingan
    │         ├── match_lineup (N)  → Susunan pemain
    │         └── match_event (N)   → Gol, kartu
    │
    ├── pengumuman (N)             → Komunikasi
    ├── notifikasi (N)             → Push/in-app
    ├── materi_kategori (N)        → Kategori materi
    ├── materi_latihan (N)         → Materi latihan
    └── seleksi (N)               → Seleksi pemain
```

---

## 4. Catatan Implementasi

### Multi-Tenant Isolation

Semua query **wajib** menyertakan filter `akademi_id` untuk memastikan isolasi data antar akademi.

```typescript
// Contoh: Query siswa hanya untuk akademi tertentu
const siswa = await prisma.siswa.findMany({
  where: { akademiId },
  orderBy: { namaLengkap: 'asc' },
});
```

### Indeks yang Direkomendasikan

```sql
-- Siswa
CREATE INDEX idx_siswa_akademi ON siswa(akademi_id);
CREATE INDEX idx_siswa_ku ON siswa(kelompok_umur_id);
CREATE INDEX idx_siswa_status ON siswa(status);
CREATE INDEX idx_siswa_nama ON siswa(nama_lengkap);

-- Orang Tua
CREATE INDEX idx_orang_tua_siswa ON orang_tua(siswa_id);

-- Pelatih
CREATE INDEX idx_pelatih_akademi ON pelatih(akademi_id);
CREATE INDEX idx_pelatih_status ON pelatih(status);

-- Jadwal
CREATE INDEX idx_jadwal_akademi ON jadwal_latihan(akademi_id);
CREATE INDEX idx_jadwal_ku ON jadwal_latihan(kelompok_umur_id);
CREATE INDEX idx_jadwal_tanggal ON jadwal_latihan(tanggal);

-- Absensi
CREATE INDEX idx_absensi_jadwal ON absensi(jadwal_id);
CREATE INDEX idx_absensi_siswa ON absensi(siswa_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);

-- SPP
CREATE INDEX idx_spp_tagihan_siswa ON spp_tagihan(siswa_id);
CREATE INDEX idx_spp_tagihan_status ON spp_tagihan(status);

-- Evaluasi
CREATE INDEX idx_evaluasi_siswa ON evaluasi(siswa_id);
CREATE INDEX idx_evaluasi_semester ON evaluasi(semester, tahun_ajaran);

-- Turnamen
CREATE INDEX idx_turnamen_akademi ON turnamen(akademi_id);
CREATE INDEX idx_match_turnamen ON match(turnamen_id);
CREATE INDEX idx_match_lineup_match ON match_lineup(match_id);

-- RBAC
CREATE INDEX idx_role_users_user ON role_users(user_id);
CREATE INDEX idx_role_users_akademi ON role_users(akademi_id);
CREATE INDEX idx_permission_roles_role ON permission_roles(role_id);

-- Unique constraints (composite)
ALTER TABLE absensi ADD CONSTRAINT uq_absensi_jadwal_siswa_tanggal UNIQUE (jadwal_id, siswa_id, tanggal);
ALTER TABLE spp_tagihan ADD CONSTRAINT uq_spp_siswa_bulan_tahun UNIQUE (siswa_id, bulan, tahun);
ALTER TABLE evaluasi ADD CONSTRAINT uq_evaluasi_siswa_semester UNIQUE (siswa_id, semester, tahun_ajaran);
ALTER TABLE turnamen_peserta ADD CONSTRAINT uq_turnamen_siswa UNIQUE (turnamen_id, siswa_id);
ALTER TABLE match_lineup ADD CONSTRAINT uq_match_siswa_tim UNIQUE (match_id, siswa_id, tim);
ALTER TABLE seleksi_peserta ADD CONSTRAINT uq_seleksi_siswa UNIQUE (seleksi_id, siswa_id);
```

### File Storage (S3-Compatible)

Untuk foto siswa, pelatih, dokumen, dan bukti pembayaran, file disimpan di **S3-Compatible Storage (MinIO / AWS S3)**. URL-nya disimpan di kolom `foto_url`, `file_url`, atau `bukti_url` pada tabel terkait.
