# 🗺️ Rencana Migrasi ke Drizzle ORM & Multi-Tenant (Schema-per-Tenant)

Dokumen ini berisi panduan langkah-demi-langkah bagi AI Developer untuk melakukan migrasi dari **Prisma ORM** ke **Drizzle ORM** dengan dukungan arsitektur **Multi-Tenant (Schema-per-Tenant)** pada project **SaaS Sport Management**.

---

## 🎯 Tujuan Utama
1. Mengganti **Prisma** dengan **Drizzle ORM** di package `@repo/db`.
2. Mendukung pembagian schema PostgreSQL secara dinamis:
   - Skema `public`: Menyimpan data global (Auth Better Auth, RBAC, Daftar Akademi/Tenant).
   - Skema `tenant_{slug}`: Menyimpan data operasional khusus tiap akademi (Siswa, Pelatih, Keuangan, dll.).
3. Menjamin **Type Safety** penuh untuk query ke skema global maupun skema tenant dinamis.
4. Migrasi adapter **Better Auth** dari Prisma ke Drizzle.

---

## 📂 Rencana Struktur Direktori (`packages/db`)

Ubah struktur di `packages/db` menjadi seperti ini:
```text
packages/db/
├── src/
│   ├── schema/
│   │   ├── public.ts      # Skema tabel global & Better Auth
│   │   └── tenant.ts      # Skema tabel operasional tenant (dynamic pgSchema)
│   └── index.ts          # Client & exports
├── drizzle/              # Folder output migrasi (untuk skema public)
├── drizzle.config.ts     # Konfigurasi Drizzle Kit
├── package.json
└── tsconfig.json
```

---

## 🛠️ Langkah-Langkah Implementasi

### Langkah 1: Instalasi Dependencies
Di dalam folder `packages/db`, jalankan instalasi package berikut:
- Dependencies: `drizzle-orm`, `postgres` (driver Postgres.js) atau `pg` (dengan `@types/pg`).
- DevDependencies: `drizzle-kit`

Hapus package `@prisma/client` dan `prisma` setelah migrasi selesai.

---

### Langkah 2: Definisikan Skema Drizzle

#### 1. Skema Global (`packages/db/src/schema/public.ts`)
Tulis tabel-tabel berikut menggunakan sintaks Drizzle (sesuaikan dengan Better Auth dan RBAC yang ada di `schema.prisma`):
* `users`
* `sessions`
* `accounts`
* `verifications`
* `roles`
* `permissions`
* `role_users`
* `permission_roles`
* `menus`
* `akademi` (Tenant Registry)
* `user_akademis` (Relasi User ↔ Akademi)

*Contoh Pendefinisian:*
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

// Lanjutkan untuk tabel lainnya...
```

#### 2. Skema Tenant Dinamis (`packages/db/src/schema/tenant.ts`)
Bungkus semua 27 tabel tenant di dalam fungsi `getTenantSchema(slug: string)` menggunakan `pgSchema` agar nama skema bisa dibuat dinamis per tenant:
* `kelompok_umur`, `master_posisi`, `master_pelanggaran`
* `siswa`, `orang_tua`, `dokumen_siswa`
* `pelatih`, `pelatih_lisensi`, `pelatih_jabatan`
* `jadwal_latihan`, `absensi`
* `spp_tagihan`, `spp_pembayaran`, `buku_kas`, `tabungan`
* `evaluasi`, `tes_fisik`, `seleksi`, `seleksi_peserta`, `pelanggaran`
* `pengumuman`, `notifikasi`
* `turnamen`, `turnamen_peserta`, `match`, `match_lineup`, `match_event`
* `materi_kategori`, `materi_latihan`, `log_pelatih`
* `inventaris`, `inventaris_distribusi`, `inventaris_mutasi`

*Contoh Pendefinisian:*
```typescript
import { pgSchema, uuid, varchar, date, integer, decimal, timestamp, text } from 'drizzle-orm/pg-core';

export const getTenantSchema = (slug: string) => {
  const tenant = pgSchema(`tenant_${slug}`);

  const kelompokUmur = tenant.table('kelompok_umur', {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 30 }).notNull(),
    usiaMin: integer('usia_min'),
    usiaMax: integer('usia_max'),
    createdAt: timestamp('created_at').defaultNow(),
  });

  const siswa = tenant.table('siswa', {
    id: uuid('id').primaryKey().defaultRandom(),
    kelompokUmurId: uuid('kelompok_umur_id').references(() => kelompokUmur.id, { onDelete: 'set null' }),
    namaLengkap: varchar('nama_lengkap', { length: 100 }).notNull(),
    tanggalLahir: date('tanggal_lahir').notNull(),
    status: varchar('status', { length: 20 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

  return {
    kelompokUmur,
    siswa,
    // kembalikan semua tabel tenant di sini
  };
};
```

---

### Langkah 3: Setup Drizzle Client (`packages/db/src/index.ts`)
Buat koneksi database singleton menggunakan driver `postgres` atau `pg`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as publicSchema from './schema/public';

const connectionString = process.env.DATABASE_URL!;

// Mencegah multiple connection di development mode (seperti pola Prisma sebelumnya)
const globalForDrizzle = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const queryClient = globalForDrizzle.conn ?? postgres(connectionString);
if (process.env.NODE_ENV !== 'production') globalForDrizzle.conn = queryClient;

export const db = drizzle(queryClient, { schema: publicSchema });
export * from './schema/public';
export * from './schema/tenant';
```

---

### Langkah 4: Migrasi Better Auth ke Drizzle
Ubah konfigurasi **Better Auth** di backend/API agar menggunakan **Drizzle Adapter** alih-alih Prisma Adapter.
* Dokumen referensi: [Better Auth Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle)
* Kirimkan instance `db` dan skema tabel global ke opsi adapter Better Auth.

---

### Langkah 5: Ganti PrismaService dengan DrizzleService di NestJS (`apps/api`)
1. Buat module `DrizzleModule` dan service `DrizzleService` di dalam `apps/api/src/drizzle/`.
2. `DrizzleService` bertugas melakukan inject instance `db` dari `@repo/db`.
3. Hapus `PrismaModule` dan `PrismaService` dari seluruh imports di `app.module.ts` dan ganti dengan `DrizzleModule`.

---

### Langkah 6: Implementasi Tenant Middleware & Provisioning Service

#### 1. Update Middleware (`apps/api/src/common/middleware/tenant.middleware.ts`)
Ubah middleware agar melakukan query ke skema `public` menggunakan Drizzle untuk mendeteksi akademi default milik user, lalu simpan slug & schemaName ke request context (`req.tenantSlug` & `req.tenantSchema`).

#### 2. Update Provisioning Service (`apps/api/src/modules/tenant/tenant-provisioning.service.ts`)
Ubah service ini untuk membuat skema baru secara dinamis menggunakan Drizzle:
- Jalankan query `CREATE SCHEMA IF NOT EXISTS tenant_{slug}`.
- Baca file `database/tenant_schema_template.sql` dan jalankan statement-nya di dalam scope transaksi (`db.transaction`) setelah melakukan `SET search_path TO tenant_{slug}`.
- Jalankan seeding data awal (seperti `master_posisi` dan `kelompok_umur` default) langsung ke skema baru.

---

### Langkah 7: Cleanup
Setelah semua fungsionalitas berjalan dengan baik:
1. Hapus folder `packages/db/prisma`.
2. Hapus `@prisma/client` dan `prisma` dari `packages/db/package.json` dan `apps/api/package.json`.
3. Jalankan build di root monorepo (`bun run build` atau `npm run build`) untuk memastikan tidak ada lagi sisa error TypeScript terkait Prisma.

---

## ⚡ Cara Melakukan Query di Resolvers/Controllers (Contoh untuk AI)

Untuk query data operasional tenant yang bersifat dinamis:
```typescript
import { getTenantSchema } from '@repo/db';
import { eq } from 'drizzle-orm';

// Di dalam resolver/controller:
const tenantSlug = req.tenantSlug; // Diperoleh dari TenantMiddleware
const tenantDb = getTenantSchema(tenantSlug);

// Query dengan tipe data yang aman & terisolasi penuh
const daftarSiswa = await db
  .select()
  .from(tenantDb.siswa)
  .where(eq(tenantDb.siswa.status, 'aktif'));
```
