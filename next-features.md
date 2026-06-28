# 🏗️ Arsitektur Multi-Tenant — Diskusi & Keputusan Teknis

> Dokumen ini membahas strategi isolasi data untuk SaaS Manajemen SSB.
> Ditulis berdasarkan review `ROADMAP.md`, `database/schema.sql`, dan `packages/db/prisma/schema.prisma`.

---

## 📌 Pertanyaan Inti

> _"Apakah tabel-tabel tenant (siswa, pelatih, keuangan, dll.) seharusnya ada di skema `public`?
> Atau schema-per-tenant? Atau 2 database terpisah (master + tenant)?"_

**Jawaban: Tidak, data tenant TIDAK seharusnya semua di `public` schema.**

Data global/master ada di `public`, data operasional per-tenant ada di schema terpisah.

---

## 🏆 Pendekatan Multi-Tenant yang Dipilih: Schema-per-Tenant (Pendekatan B)

Berdasarkan diskusi dan keputusan teknis, sistem menggunakan **Pendekatan B: Schema-per-Tenant** dengan **Drizzle ORM**.

```
PostgreSQL Database (1 database)
├── public (schema global/master)
│   ├── akademi                 ← daftar semua tenant
│   ├── users                   ← auth, login (Better Auth)
│   ├── sessions                ← session management
│   ├── accounts                ← OAuth provider
│   ├── verifications           ← email verification
│   ├── roles                   ← role definitions (global)
│   ├── permissions             ← permission definitions (global)
│   ├── permission_roles        ← role-permission mapping
│   ├── role_users              ← user-role assignment
│   ├── menus                   ← navigasi UI
│   ├── plans / subscriptions   ← paket SaaS
│   └── audit_log               ← log global
│
├── tenant_ssb_bintang_jaya (schema per-tenant)
│   ├── siswa
│   ├── orang_tua
│   ├── dokumen_siswa
│   ├── pelatih, pelatih_lisensi, pelatih_jabatan
│   ├── kelompok_umur, master_posisi, master_pelanggaran
│   ├── jadwal_latihan, absensi
│   ├── spp_tagihan, spp_pembayaran, buku_kas, tabungan
│   ├── evaluasi, tes_fisik, seleksi
│   ├── turnamen, match, match_lineup, match_event
│   ├── pengumuman, notifikasi
│   ├── inventaris, inventaris_distribusi, inventaris_mutasi
│   └── materi_kategori, materi_latihan, log_pelatih
│
└── tenant_ssb_garuda_muda (schema per-tenant — struktur identik)
    └── ...
```

**Cara Kerja & Isolasi Data:**

- **Pemisahan Data:** Data global (autentikasi, RBAC, penagihan, menu) disimpan di skema `public`. Data operasional (siswa, pelatih, keuangan, dll.) dipisahkan ke dalam skema unik per tenant: `tenant_{slug}`.
- **Type Safety dengan Drizzle:** Menggunakan dynamic `pgSchema` dari Drizzle ORM sehingga query ke tabel tenant terisolasi secara tipe dan namespace tanpa perlu melakukan `SET search_path` di level query manual.
- **Manajemen Mudah:** Hapus tenant cukup dengan `DROP SCHEMA tenant_{slug} CASCADE`, dan backup per tenant dapat dilakukan secara independen via `pg_dump --schema=tenant_{slug}`.

---

## 🔧 Detail Implementasi Schema-per-Tenant

### 1. Pembagian Tabel: Public vs Tenant

#### `public` schema (shared/global) — 12 tabel:

| Tabel              | Fungsi                              | Status        |
| ------------------ | ----------------------------------- | ------------- |
| `akademi`          | Registry semua tenant + profil SSB  | BARU          |
| `users`            | Auth user (Better Auth)             | SUDAH ADA     |
| `sessions`         | Session management                  | SUDAH ADA     |
| `accounts`         | OAuth provider accounts             | SUDAH ADA     |
| `verifications`    | Email verification                  | SUDAH ADA     |
| `roles`            | Definisi role (admin, pelatih, dll) | SUDAH ADA     |
| `permissions`      | Definisi permission                 | SUDAH ADA     |
| `permission_roles` | Mapping role ↔ permission           | SUDAH ADA     |
| `role_users`       | Mapping user ↔ role                 | SUDAH ADA     |
| `menus`            | Navigasi UI sidebar                 | SUDAH ADA     |
| `plans`            | Paket langganan SaaS                | BARU (Fase 5) |
| `subscriptions`    | Riwayat langganan per-akademi       | BARU (Fase 5) |

#### `tenant_{slug}` schema (per-tenant) — 27 tabel:

| Grup            | Tabel                   | Fungsi                            |
| --------------- | ----------------------- | --------------------------------- |
| **Master Data** | `kelompok_umur`         | U-6 s/d U-18                      |
|                 | `master_posisi`         | GK, DF, MF, FW                    |
|                 | `master_pelanggaran`    | Jenis pelanggaran + poin          |
| **Siswa**       | `siswa`                 | Data lengkap siswa                |
|                 | `orang_tua`             | Data ayah/ibu/wali (1:1 ke siswa) |
|                 | `dokumen_siswa`         | Upload akta, KK, NISN             |
| **Pelatih**     | `pelatih`               | Data pelatih + foto               |
|                 | `pelatih_lisensi`       | Sertifikat D/C/B/A/Pro AFC        |
|                 | `pelatih_jabatan`       | Penugasan ke kelompok umur        |
| **Operasional** | `jadwal_latihan`        | Jadwal per kelompok umur          |
|                 | `absensi`               | Kehadiran per sesi                |
| **Keuangan**    | `spp_tagihan`           | Tagihan bulanan                   |
|                 | `spp_pembayaran`        | Pembayaran + bukti                |
|                 | `buku_kas`              | Pemasukan & pengeluaran           |
|                 | `tabungan`              | Simpan/tarik per siswa            |
| **Evaluasi**    | `evaluasi`              | Rapor semester                    |
|                 | `tes_fisik`             | Hasil tes fisik                   |
|                 | `seleksi`               | Event seleksi                     |
|                 | `seleksi_peserta`       | Peserta + hasil seleksi           |
|                 | `pelanggaran`           | Catatan pelanggaran               |
| **Komunikasi**  | `pengumuman`            | Broadcast per kelompok/role       |
|                 | `notifikasi`            | Notifikasi personal               |
| **Turnamen**    | `turnamen`              | Event turnamen                    |
|                 | `turnamen_peserta`      | Peserta + statistik               |
|                 | `match`                 | Detail pertandingan               |
|                 | `match_lineup`          | Susunan pemain                    |
|                 | `match_event`           | Gol, kartu, assist                |
| **Kurikulum**   | `materi_kategori`       | Kategori materi latihan           |
|                 | `materi_latihan`        | Konten materi                     |
|                 | `log_pelatih`           | Log aktivitas pelatih             |
| **Inventaris**  | `inventaris`            | Master barang                     |
|                 | `inventaris_distribusi` | Distribusi ke siswa               |
|                 | `inventaris_mutasi`     | Mutasi stok masuk/keluar          |

> ⚠️ **Penting:** Tabel di tenant schema **TIDAK perlu kolom `akademi_id`**. Schema itu sendiri sudah menjadi boundary.

---

### 2. Perubahan Prisma Schema (`public`)

````prisma
### 2. Drizzle Schema (`public` & `tenant` Dynamic)

Definisi skema global (`public`) dan operasional (`tenant`) menggunakan Drizzle ORM.

#### A. Skema Public (`packages/db/src/schema/public.ts`)
```typescript
import { pgTable, text, timestamp, boolean, varchar, integer, serial, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  label: varchar('label', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const roleUsers = pgTable('role_users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => [
  unique().on(t.userId, t.roleId)
]);

export const permissionRoles = pgTable('permission_roles', {
  id: serial('id').primaryKey(),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => [
  unique().on(t.permissionId, t.roleId)
]);

export const menus = pgTable('menus', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  route: varchar('route', { length: 255 }),
  icon: varchar('icon', { length: 255 }),
  parentId: integer('parent_id'),
  orderNo: integer('order_no').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const akademi = pgTable('akademi', {
  id: text('id').primaryKey(),
  nama: varchar('nama', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  logoUrl: text('logo_url'),
  alamat: text('alamat'),
  noHp: varchar('no_hp', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 200 }),
  paket: varchar('paket', { length: 20 }).default('gratis').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const userAkademis = pgTable('user_akademis', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  akademiId: text('akademi_id').notNull().references(() => akademi.id, { onDelete: 'cascade' }),
  isDefault: boolean('is_default').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.userId, t.akademiId)
]);
````

#### B. Skema Tenant Dynamic (`packages/db/src/schema/tenant.ts`)

Drizzle mempermudah pendefinisian tabel tenant di dalam fungsi yang menerima nama schema dinamis. Hal ini menjamin type safety penuh tanpa perlu `SET search_path` di level query.

```typescript
import {
  pgSchema,
  uuid,
  varchar,
  date,
  integer,
  decimal,
  timestamp,
  boolean,
  time,
  text,
} from "drizzle-orm/pg-core";
import { users } from "./public";

export const getTenantSchema = (slug: string) => {
  const tenant = pgSchema(`tenant_${slug}`);

  const kelompokUmur = tenant.table("kelompok_umur", {
    id: uuid("id").primaryKey().defaultRandom(),
    nama: varchar("nama", { length: 30 }).notNull(),
    usiaMin: integer("usia_min"),
    usiaMax: integer("usia_max"),
    createdAt: timestamp("created_at").defaultNow(),
  });

  const masterPosisi = tenant.table("master_posisi", {
    id: uuid("id").primaryKey().defaultRandom(),
    kode: varchar("kode", { length: 10 }).notNull(),
    nama: varchar("nama", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });

  const masterPelanggaran = tenant.table("master_pelanggaran", {
    id: uuid("id").primaryKey().defaultRandom(),
    nama: varchar("nama", { length: 100 }).notNull(),
    poin: integer("poin").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  });

  const siswa = tenant.table("siswa", {
    id: uuid("id").primaryKey().defaultRandom(),
    kelompokUmurId: uuid("kelompok_umur_id").references(() => kelompokUmur.id, {
      onDelete: "set null",
    }),
    nisn: varchar("nisn", { length: 20 }),
    nik: varchar("nik", { length: 20 }),
    namaLengkap: varchar("nama_lengkap", { length: 100 }).notNull(),
    namaPanggilan: varchar("nama_panggilan", { length: 50 }),
    tempatLahir: varchar("tempat_lahir", { length: 50 }),
    tanggalLahir: date("tanggal_lahir").notNull(),
    jenisKelamin: varchar("jenis_kelamin", { length: 1 }),
    agama: varchar("agama", { length: 20 }),
    posisiId: uuid("posisi_id").references(() => masterPosisi.id, {
      onDelete: "set null",
    }),
    tinggiBadan: decimal("tinggi_badan", { precision: 5, scale: 1 }),
    beratBadan: decimal("berat_badan", { precision: 5, scale: 1 }),
    fotoUrl: text("foto_url"),
    status: varchar("status", { length: 20 }).default("pending"),
    klubSebelumnya: varchar("klub_sebelumnya", { length: 100 }),
    provinsi: varchar("provinsi", { length: 50 }),
    kabupaten: varchar("kabupaten", { length: 50 }),
    kecamatan: varchar("kecamatan", { length: 50 }),
    desa: varchar("desa", { length: 50 }),
    alamatLengkap: text("alamat_lengkap"),
    catatan: text("catatan"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });

  // ... (Tabel tenant lainnya didefinisikan dengan pola serupa)

  return {
    kelompokUmur,
    masterPosisi,
    masterPelanggaran,
    siswa,
  };
};
```

---

### 3. SQL Template untuk Tenant Schema

File ini akan dijalankan saat provisioning tenant baru. Semua `akademi_id` dihilangkan karena schema = tenant boundary.

````sql
-- template: tenant_schema_template.sql
-- Dijalankan dengan: SET search_path TO 'tenant_{slug}';

-- Master Data
CREATE TABLE kelompok_umur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(30) NOT NULL,
    usia_min INT,
    usia_max INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_posisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(10) NOT NULL,
    nama VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_pelanggaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    poin INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Siswa & Orang Tua
CREATE TABLE siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    nisn VARCHAR(20),
    nik VARCHAR(20),
    nama_lengkap VARCHAR(100) NOT NULL,
    nama_panggilan VARCHAR(50),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
    agama VARCHAR(20),
    posisi_id UUID REFERENCES master_posisi(id) ON DELETE SET NULL,
    tinggi_badan DECIMAL(5,1),
    berat_badan DECIMAL(5,1),
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('aktif', 'alumni', 'nonaktif', 'pending')),
    klub_sebelumnya VARCHAR(100),
    provinsi VARCHAR(50),
    kabupaten VARCHAR(50),
    kecamatan VARCHAR(50),
    desa VARCHAR(50),
    alamat_lengkap TEXT,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orang_tua (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID UNIQUE NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    nama_orang_tua VARCHAR(100) NOT NULL,
    hp_orang_tua VARCHAR(20) NOT NULL,
    hp_ayah VARCHAR(20),
    hp_ibu VARCHAR(20),
    email VARCHAR(100),
    hubungan VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dokumen_siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    jenis VARCHAR(20) NOT NULL
      CHECK (jenis IN ('akta', 'kk', 'nisn', 'kartu_pelajar', 'raport')),
    file_url TEXT NOT NULL,
    nama_file VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pelatih
CREATE TABLE pelatih (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,  -- link ke public.users
    nama_lengkap VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    email VARCHAR(100),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    provinsi VARCHAR(50),
    kabupaten VARCHAR(50),
    kecamatan VARCHAR(50),
    desa VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pelatih_lisensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    lisensi VARCHAR(20) NOT NULL CHECK (lisensi IN (
        'd_nasional', 'c_afc', 'b_afc', 'a_afc', 'pro_afc',
        'fisik', 'kiper', 'futsal', 'lainnya'
    )),
    lisensi_lainnya VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pelatih_jabatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    jabatan VARCHAR(30) NOT NULL CHECK (jabatan IN (
        'pelatih_ku', 'pelatih_kiper', 'pelatih_fisik',
        'asisten', 'kepala_pelatih', 'koordinator'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadwal & Absensi
CREATE TABLE jadwal_latihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    hari VARCHAR(10) CHECK (hari IN (
        'senin','selasa','rabu','kamis','jumat','sabtu','minggu'
    )),
    waktu_mulai TIME,
    waktu_selesai TIME,
    lokasi VARCHAR(200),
    materi TEXT,
    tanggal DATE,
    status VARCHAR(20) DEFAULT 'aktif'
      CHECK (status IN ('aktif', 'batal', 'selesai')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jadwal_id UUID NOT NULL REFERENCES jadwal_latihan(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status VARCHAR(10) NOT NULL
      CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (jadwal_id, siswa_id, tanggal)
);

-- Keuangan
CREATE TABLE spp_tagihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'belum'
      CHECK (status IN ('lunas', 'belum', 'dispensasi')),
    jatuh_tempo DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (siswa_id, bulan, tahun)
);

CREATE TABLE spp_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id UUID NOT NULL REFERENCES spp_tagihan(id) ON DELETE CASCADE,
    tanggal_bayar DATE NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    metode VARCHAR(20) CHECK (metode IN ('tunai', 'transfer', 'qris', 'lainnya')),
    bukti_url TEXT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buku_kas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
    kategori VARCHAR(50),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tabungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('simpan', 'tarik')),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluasi & Penilaian
CREATE TABLE tes_fisik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    jenis_tes VARCHAR(50) NOT NULL,
    nilai DECIMAL(8,2) NOT NULL,
    satuan VARCHAR(20),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    pelatih_id UUID REFERENCES pelatih(id) ON DELETE SET NULL,
    semester VARCHAR(10) NOT NULL,
    tahun_ajaran VARCHAR(10) NOT NULL,
    teknik INT CHECK (teknik BETWEEN 0 AND 100),
    fisik INT CHECK (fisik BETWEEN 0 AND 100),
    taktik INT CHECK (taktik BETWEEN 0 AND 100),
    mental INT CHECK (mental BETWEEN 0 AND 100),
    catatan_pelatih TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (siswa_id, semester, tahun_ajaran)
);

CREATE TABLE seleksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    tanggal DATE,
    lokasi VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seleksi_peserta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seleksi_id UUID NOT NULL REFERENCES seleksi(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'daftar'
      CHECK (status IN ('daftar', 'lulus', 'tidak_lulus')),
    nilai DECIMAL(5,2),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (seleksi_id, siswa_id)
);

CREATE TABLE pelanggaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    master_pelanggaran_id UUID REFERENCES master_pelanggaran(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Komunikasi
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    target VARCHAR(20) DEFAULT 'semua'
      CHECK (target IN ('semua', 'siswa', 'orang_tua', 'pelatih')),
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifikasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    penerima_user_id TEXT,  -- reference ke public.users(id)
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    tipe VARCHAR(20) DEFAULT 'info'
      CHECK (tipe IN ('info', 'pengumuman', 'spp', 'jadwal', 'absensi', 'turnamen')),
    target VARCHAR(20) DEFAULT 'semua'
      CHECK (target IN ('semua', 'siswa', 'orang_tua', 'pelatih', 'per_siswa')),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via VARCHAR(20) DEFAULT 'in_app'
      CHECK (sent_via IN ('in_app', 'push', 'wa', 'email')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Turnamen & Pertandingan
CREATE TABLE turnamen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    lokasi VARCHAR(200),
    kategori_umur VARCHAR(30),
    hasil TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE turnamen_peserta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turnamen_id UUID NOT NULL REFERENCES turnamen(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    posisi VARCHAR(20),
    gol INT DEFAULT 0,
    kartu_kuning INT DEFAULT 0,
    kartu_merah INT DEFAULT 0,
    menit_bermain INT,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (turnamen_id, siswa_id)
);

CREATE TABLE match (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turnamen_id UUID NOT NULL REFERENCES turnamen(id) ON DELETE CASCADE,
    babak VARCHAR(30) DEFAULT 'penyisihan'
      CHECK (babak IN ('penyisihan', 'perempat_final', 'semi_final',
                        'final', 'grup', 'friendly')),
    match_no INT,
    tanggal DATE,
    waktu TIME,
    lokasi VARCHAR(200),
    tim_home VARCHAR(100),
    tim_away VARCHAR(100),
    skor_home INT DEFAULT 0,
    skor_away INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'belum'
      CHECK (status IN ('belum', 'berlangsung', 'selesai', 'batal')),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_lineup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tim VARCHAR(10) CHECK (tim IN ('home', 'away')),
    posisi VARCHAR(20),
    status VARCHAR(20) DEFAULT 'starter'
      CHECK (status IN ('starter', 'cadangan', 'masuk', 'keluar')),
    menit_masuk INT,
    menit_keluar INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (match_id, siswa_id, tim)
);

CREATE TABLE match_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE SET NULL,
    tipe VARCHAR(20) NOT NULL
      CHECK (tipe IN ('gol', 'assist', 'kartu_kuning', 'kartu_merah',
                       'substitusi', 'own_goal')),
    menit INT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kurikulum & Materi
CREATE TABLE materi_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materi_latihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kategori_id UUID REFERENCES materi_kategori(id) ON DELETE SET NULL,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    durasi_menit INT,
    level VARCHAR(20) DEFAULT 'pemula'
      CHECK (level IN ('pemula', 'menengah', 'lanjutan')),
    tipe VARCHAR(20) DEFAULT 'teknik'
      CHECK (tipe IN ('teknik', 'fisik', 'taktik', 'mental', 'permainan')),
    instruksi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE log_pelatih (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    jadwal_id UUID REFERENCES jadwal_latihan(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    materi_id UUID REFERENCES materi_latihan(id) ON DELETE SET NULL,
    catatan TEXT,
    durasi_menit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventaris
CREATE TABLE inventaris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    kategori VARCHAR(50)
      CHECK (kategori IN ('jersey','bola','cone','rompi','gawang','medis','lainnya')),
    jumlah INT NOT NULL DEFAULT 0,
    satuan VARCHAR(20) DEFAULT 'pcs',
    kondisi VARCHAR(20) DEFAULT 'baik'
      CHECK (kondisi IN ('baik','rusak_ringan','rusak_berat')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaris_distribusi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventaris_id UUID NOT NULL REFERENCES inventaris(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE SET NULL,
    jumlah INT NOT NULL DEFAULT 1,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'dipinjam'
      CHECK (status IN ('dipinjam','dikembalikan','hilang','milik')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaris_mutasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventaris_id UUID NOT NULL REFERENCES inventaris(id) ON DELETE CASCADE,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('masuk','keluar')),
    jumlah INT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES (per-tenant schema)
-- ==========================================
CREATE INDEX idx_siswa_ku ON siswa(kelompok_umur_id);
CREATE INDEX idx_siswa_status ON siswa(status);
CREATE INDEX idx_siswa_nama ON siswa(nama_lengkap);
CREATE INDEX idx_orang_tua_siswa ON orang_tua(siswa_id);
CREATE INDEX idx_pelatih_status ON pelatih(status);
CREATE INDEX idx_jadwal_ku ON jadwal_latihan(kelompok_umur_id);
CREATE INDEX idx_jadwal_tanggal ON jadwal_latihan(tanggal);
CREATE INDEX idx_absensi_jadwal ON absensi(jadwal_id);
CREATE INDEX idx_absensi_siswa ON absensi(siswa_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_spp_tagihan_siswa ON spp_tagihan(siswa_id);
CREATE INDEX idx_spp_tagihan_status ON spp_tagihan(status);
CREATE INDEX idx_spp_pembayaran_tagihan ON spp_pembayaran(tagihan_id);
CREATE INDEX idx_buku_kas_tanggal ON buku_kas(tanggal);
CREATE INDEX idx_tabungan_siswa // apps/api/src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { akademi, userAkademis } from '@repo/db/schema/public';
import { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private dbService: DrizzleService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const db = this.dbService.db;

    // 1. Ambil user dari session (sudah di-set oleh auth middleware)
    const userId = (req as any).user?.id;
    if (!userId) return next();

    // 2. Cari akademi default user
    const [userAkademi] = await db
      .select({
        akademiId: userAkademis.akademiId,
        slug: akademi.slug,
        nama: akademi.nama
      })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);

    if (!userAkademi) {
      return next();
    }

    // 3. Simpan tenant context di request
    const schemaName = `tenant_${userAkademi.slug}`;
    (req as any).tenantSlug = userAkademi.slug;
    (req as any).tenantSchema = schemaName;
    (req as any).akademiId = userAkademi.akademiId;

    next();
  }
}

---

### 5. Backend: Tenant Provisioning Service

```typescript
// apps/api/src/modules/tenant/tenant-provisioning.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { akademi } from '@repo/db/schema/public';
import { sql, eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(private dbService: DrizzleService) {}

  /**
   * Membuat tenant baru: schema + tabel + seed data default
   */
  async createTenant(akademiSlug: string): Promise<void> {
    const db = this.dbService.db;
    const schemaName = `tenant_${akademiSlug}`;
    this.logger.log(`Creating tenant schema: ${schemaName}`);

    // 1. Buat schema secara dinamis
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}`);

    // 2. Jalankan SQL template untuk membuat semua tabel
    const templatePath = path.join(__dirname, '../../database/tenant_schema_template.sql');
    const rawSql = fs.readFileSync(templatePath, 'utf-8');

    // Mengarahkan eksekusi template ke schema yang baru dibuat
    // Kita jalankan SET search_path di dalam transaction block untuk keamanan pool
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET search_path TO ${sql.identifier(schemaName)}`);

      const statements = rawSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        await tx.execute(sql.raw(stmt));
      }

      // 3. Seed data default dalam schema baru
      await this.seedDefaultDataInTx(tx);
    });

    this.logger.log(`Tenant ${schemaName} created successfully`);
  }

  /**
   * Seed data default ke transaksi yang sedang aktif
   */
  private async seedDefaultDataInTx(tx: any): Promise<void> {
    // Posisi default
    await tx.execute(sql`
      INSERT INTO master_posisi (kode, nama) VALUES
        ('GK', 'Penjaga Gawang'),
        ('CB', 'Bek Tengah'),
        ('RB', 'Bek Kanan'),
        ('LB', 'Bek Kiri'),
        ('CDM', 'Gelandang Bertahan'),
        ('CM', 'Gelandang Tengah'),
        ('CAM', 'Gelandang Serang'),
        ('RM', 'Gelandang Kanan'),
        ('LM', 'Gelandang Kiri'),
        ('RW', 'Sayap Kanan'),
        ('LW', 'Sayap Kiri'),
        ('ST', 'Penyerang'),
        ('CF', 'Penyerang Tengah')
    `);

    // Kelompok umur default
    await tx.execute(sql`
      INSERT INTO kelompok_umur (nama, usia_min, usia_max) VALUES
        ('U-6', 4, 6),
        ('U-8', 7, 8),
        ('U-10', 9, 10),
        ('U-12', 11, 12),
        ('U-14', 13, 14),
        ('U-16', 15, 16),
        ('U-18', 17, 18)
    `);
  }

  /**
   * Hapus tenant: drop seluruh schema
   */
  async deleteTenant(akademiSlug: string): Promise<void> {
    const db = this.dbService.db;
    const schemaName = `tenant_${akademiSlug}`;
    this.logger.warn(`Dropping tenant schema: ${schemaName}`);

    await db.execute(sql`DROP SCHEMA IF EXISTS ${sql.identifier(schemaName)} CASCADE`);

    this.logger.log(`Tenant ${schemaName} dropped successfully`);
  }

  /**
   * Jalankan migrasi ke semua tenant schema
   */
  async migrateAllTenants(migrationSQL: string): Promise<void> {
    const db = this.dbService.db;
    const activeAkademis = await db
      .select({ slug: akademi.slug })
      .from(akademi)
      .where(eq(akademi.isActive, true));

    for (const { slug } of activeAkademis) {
      const schemaName = `tenant_${slug}`;
      this.logger.log(`Migrating: ${schemaName}`);

      await db.transaction(async (tx) => {
        await tx.execute(sql`SET search_path TO ${sql.identifier(schemaName)}`);
        await tx.execute(sql.raw(migrationSQL));
      });
    }

    this.logger.log(`Migration completed for ${activeAkademis.length} tenants`);
  }
}

````

---

### 6. Frontend: Tenant Context

```typescript
// apps/web/src/hooks/useTenant.ts
import { create } from "zustand";

interface TenantState {
  akademiId: string | null;
  akademiSlug: string | null;
  akademiNama: string | null;
  setTenant: (id: string, slug: string, nama: string) => void;
  clearTenant: () => void;
}

export const useTenant = create<TenantState>((set) => ({
  akademiId: null,
  akademiSlug: null,
  akademiNama: null,
  setTenant: (id, slug, nama) =>
    set({ akademiId: id, akademiSlug: slug, akademiNama: nama }),
  clearTenant: () =>
    set({ akademiId: null, akademiSlug: null, akademiNama: null }),
}));
```

```typescript
// Apollo Client — tambahkan tenant header otomatis
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "x-tenant-slug": useTenant.getState().akademiSlug || "",
  },
});
```

---

### 7. Alur Registrasi Akademi Baru (Onboarding)

```
┌──────────────────────────────────────────────────────┐
│                  FLOW ONBOARDING                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. User register (email + password)                 │
│     └─→ INSERT INTO public.users                     │
│     └─→ INSERT INTO public.accounts                  │
│                                                      │
│  2. User isi form "Daftarkan Akademi Baru"           │
│     ├── Nama Akademi: "SSB Bintang Jaya"             │
│     ├── Slug: "ssb-bintang-jaya" (auto-generate)     │
│     ├── Alamat, No HP, Email, Logo                   │
│     └── Pilih Paket: gratis / starter / growth / pro │
│                                                      │
│  3. Backend:                                         │
│     ├── INSERT INTO public.akademi                   │
│     ├── INSERT INTO public.user_akademis              │
│     ├── CREATE SCHEMA tenant_ssb_bintang_jaya        │
│     ├── Run tenant_schema_template.sql               │
│     ├── Seed posisi, kelompok umur default            │
│     └── Assign role "admin" ke user                   │
│                                                      │
│  4. Redirect → /dashboard                            │
│     └─→ Sidebar muncul sesuai role + permission      │
│     └─→ Semua query operasional → tenant schema      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 8. Keamanan & Best Practices

| Aspek                              | Implementasi                                                   |
| ---------------------------------- | -------------------------------------------------------------- |
| **SQL Injection pada schema name** | Validasi slug: hanya `[a-z0-9_-]`, max 50 char                 |
| **Schema tidak ditemukan**         | Check `information_schema.schemata` sebelum SET                |
| **Cross-tenant access**            | Middleware WAJIB set `search_path` sebelum query               |
| **Superadmin bypass**              | Superadmin bisa `SET search_path TO tenant_xxx, public` manual |
| **Audit trail**                    | Log setiap `SET search_path` ke audit_log                      |
| **Connection pooling**             | Reset `search_path` setelah request selesai                    |
| **Backup**                         | Cron job: `pg_dump --schema=tenant_{slug}` per-tenant          |

---

## 🗺️ Roadmap Implementasi

### Fase 0.1 — Fondasi Multi-Tenant

- [x] Migrasi ke Drizzle ORM (Skema global & tenant dinamis)
- [x] Buat file `tenant_schema_template.sql`
- [x] Buat `TenantProvisioningService`
- [x] Buat `TenantMiddleware` (mendeteksi context tenant)
- [x] Konfigurasi Better Auth Drizzle Adapter
- [ ] Buat halaman "Daftarkan Akademi Baru" (Frontend)
- [ ] Testing: buat 2 tenant, pastikan data terisolasi

### Fase 0.2 — Tenant-Aware API & Frontend

- [ ] **Update GraphQL Resolvers (Backend)**
  * **Cara kerja:**
    1. Buat custom decorator `@TenantSlug()` di NestJS untuk mengekstrak `req.tenantSlug` yang diisi oleh `TenantMiddleware`.
    2. Pada resolver operasional (seperti `SiswaResolver`, `PelatihResolver`), gunakan decorator tersebut untuk mendapatkan slug tenant aktif.
    3. Panggil `getTenantSchema(slug)` untuk mendapatkan instansi tabel tenant yang type-safe, lalu jalankan query Drizzle.
  * **Contoh Implementasi:**
    ```typescript
    @Query(() => [SiswaType])
    async getSiswa(@TenantSlug() slug: string) {
      const tenantDb = getTenantSchema(slug);
      return this.dbService.db.select().from(tenantDb.siswa);
    }
    ```

- [ ] **Buat `useTenant` Hook & State (Frontend - Next.js & Expo)**
  * **Cara kerja:** Buat store global (menggunakan Zustand atau React Context) untuk menyimpan data tenant aktif (`id`, `slug`, `nama`).
  * **Next.js:** Simpan data tenant di local storage setelah user berhasil login dan memilih akademi.
  * **Expo Mobile:** Simpan menggunakan `AsyncStorage` untuk mendukung offline-first.

- [ ] **Update Apollo Client — Kirim `x-tenant-slug` Header (Frontend)**
  * **Cara kerja:** Konfigurasikan Apollo Link di Next.js & Mobile agar menyisipkan header `x-tenant-slug` secara otomatis di setiap request GraphQL.
  * **Contoh Implementasi:**
    ```typescript
    const httpLink = createHttpLink({ uri: process.env.NEXT_PUBLIC_API_URL });
    const tenantLink = setContext((_, { headers }) => {
      const slug = useTenant.getState().slug;
      return {
        headers: {
          ...headers,
          'x-tenant-slug': slug || '',
        }
      };
    });
    const client = new ApolloClient({
      link: tenantLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
    ```

- [ ] **Update Sidebar & UI Header (Frontend)**
  * **Cara kerja:** Ambil `nama` akademi dari `useTenant` untuk ditampilkan pada judul sidebar atau header dashboard sebagai penanda tenant yang sedang diakses.

- [ ] **Buat Tenant Switcher untuk Superadmin (Frontend)**
  * **Cara kerja:** Buat komponen dropdown khusus di dashboard Next.js yang hanya muncul jika role user adalah `SUPER_ADMIN`. Dropdown ini berisi daftar semua akademi aktif. Ketika dipilih, panggil `setTenant(slug)` untuk memperbarui store `useTenant`, sehingga seluruh query berikutnya otomatis mengarah ke tenant tersebut.

### Fase 0.3 — Migration Runner

- [ ] **Buat Service `migrateAllTenants` di Drizzle (Backend)**
  * **Cara kerja:**
    1. Buat service `TenantMigrationService` yang mengambil daftar semua akademi aktif dari skema `public`.
    2. Lakukan iterasi (loop) untuk setiap akademi.
    3. Di dalam loop, buka Drizzle `db.transaction` dan jalankan statement `SET search_path TO tenant_{slug}` diikuti dengan eksekusi raw DDL sql migrasi.
  * **Keamanan:** Pastikan SQL migrasi dijalankan dalam blok transaksi terisolasi agar kegagalan migrasi di satu tenant tidak mengganggu tenant lainnya.

- [ ] **Integrasi ke CI/CD Pipeline**
  * **Cara kerja:** Tambahkan step setelah migrasi skema `public` (via `drizzle-kit migrate`) untuk memicu endpoint/script migrasi seluruh tenant secara otomatis saat deployment.

- [ ] **Testing Migrasi Skema**
  * **Cara kerja:** Tambahkan kolom baru (misal: `catatan_kesehatan` di tabel `siswa`), jalankan script migrasi, dan verifikasi apakah kolom tersebut sukses terbuat di semua skema `tenant_*`.

---

## 🏆 Keputusan yang Telah Diambil

1. **User ↔ Akademi**: 1 user = 1 akademi default (database mendukung multi-akademi via tabel `user_akademis` jika diperlukan di masa depan).
2. **Superadmin**: Superadmin = platform owner (mengelola semua akademi). Admin = per-akademi (hanya memiliki hak akses pada akademi tempat ia ditugaskan).
3. **Routing**: Path-based (`/dashboard` dengan context header `x-tenant-slug` untuk API).
4. **ORM**: **Drizzle ORM** secara penuh karena mendukung dynamic schema (`pgSchema`) secara native untuk tenant, serta menjamin type safety penuh.
5. **Tenant tables**: Drizzle Schema dinamis untuk query & mutasi data yang type-safe. Raw SQL / Drizzle DDL untuk proses provisioning & schema creation saat akademi baru mendaftar.

## 🚀 Fitur Selanjutnya & Prioritas Pengembangan

Berdasarkan dokumen panduan di direktori `pattern/`, berikut adalah daftar fitur operasional yang akan diimplementasikan setelah fondasi multi-tenant selesai:

### 1. Fase 0.2 & 0.3 — Integrasi Multi-Tenant & API
* [ ] **GraphQL Resolver Tenant-Aware:** Menyesuaikan semua resolver di NestJS agar membaca `req.tenantSlug` dan mengarahkan query menggunakan `getTenantSchema(slug)`.
* [ ] **Frontend Apollo Client Integration:** Mengatur Apollo Client di Next.js & Mobile agar otomatis mengirimkan header `x-tenant-slug`.
* [ ] **Tenant Switcher:** Halaman khusus bagi Superadmin untuk berpindah konteks antar tenant akademi secara dinamis.
* [ ] **Migration Runner:** Membuat skrip otomatis untuk menjalankan migrasi DDL Drizzle ke seluruh skema `tenant_*` yang aktif.

---

### 2. Fase 1 — MVP (Minimum Viable Product)
Fokus pada fitur dasar yang harus ada di web dashboard (Admin) dan mobile app (Pelatih/Siswa):

* **🔐 Autentikasi & Onboarding**
  * Registrasi akun baru & pembuatan akademi baru (otomatis men-trigger `TenantProvisioningService` untuk membuat skema database).
  * Login adaptif sesuai role (Admin masuk ke Web, Pelatih/Orang Tua masuk ke Mobile).
* **📊 Dashboard Adaptif (Beranda)**
  * Dashboard Admin (Web): Grafik siswa, pelatih, absensi, dan ringkasan keuangan.
  * Dashboard Pelatih (Mobile): Jadwal hari ini, absensi cepat, dan log aktivitas.
  * Dashboard Orang Tua (Mobile): Profil anak, kehadiran anak, dan status tagihan SPP.
* **👥 Manajemen Siswa & Orang Tua**
  * CRUD data siswa lengkap (27 field termasuk foto, kelompok umur, posisi bermain).
  * Manajemen data Wali/Orang Tua (relasi 1:1 ke siswa).
  * Upload dokumen siswa (Akta Lahir, KK, NISN).
* **📅 Jadwal Latihan**
  * Kalender latihan per kelompok umur.
  * Penentuan lokasi, hari, jam, dan materi latihan.
  * Status jadwal (aktif, batal, selesai).
* **📝 Absensi Digital**
  * Input absensi secara kolektif (batch) per sesi latihan oleh pelatih.
  * 4 status kehadiran: Hadir, Izin, Sakit, Alpha.
  * Persentase kehadiran otomatis per siswa.

---

### 3. Fase 2 — Keuangan & Evaluasi
* **💰 Keuangan & SPP**
  * Pembuatan tagihan SPP otomatis setiap awal bulan per siswa.
  * Pencatatan cicilan SPP (1 tagihan dapat dicicil beberapa kali).
  * Buku Kas masuk & keluar untuk keuangan akademi.
  * Manajemen Tabungan siswa.
* **📊 Evaluasi & Raport**
  * Input nilai evaluasi per siswa per semester (Teknik, Fisik, Taktik, Mental).
  * Visualisasi radar chart (4 dimensi) perkembangan siswa.
  * Export raport ke format PDF.
* **🏃 Tes Fisik**
  * Pencatatan hasil tes fisik berkala (sprint, stamina, kelincahan, dll.).
  * Fitur perankingan (leaderboard) fisik siswa per kelompok umur.

---

### 4. Fase 3 — Komunikasi & Notifikasi
* **📢 Pengumuman**
  * Pembuatan pengumuman dengan target spesifik (semua, per kelompok umur, per role).
* **🔔 Notifikasi Push & Integrasi**
  * Notifikasi push otomatis ke HP Orang Tua (contoh: saat anak diabsen hadir, atau tagihan SPP dirilis).
  * Pengiriman notifikasi via Whatsapp/Email.

---

### 5. Fase 4 — Turnamen & Kurikulum
* **🏆 Turnamen & Pertandingan (Match)**
  * Pendaftaran turnamen yang diikuti akademi.
  * Manajemen susunan pemain (lineup) starter & cadangan per match.
  * Log match events (gol, assist, kartu kuning/merah, pergantian pemain).
  * Klasemen turnamen otomatis.
* **📖 Kurikulum & Materi Latihan**
  * Manajemen pustaka materi latihan berdasarkan kurikulum Filanesia PSSI.
  * Pembagian materi berdasarkan tahapan usia (kelompok umur) dan tingkat kesulitan (pemula, menengah, lanjutan).
