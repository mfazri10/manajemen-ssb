# Standar dan Pattern Database (Prisma ORM)

Dokumen ini merangkum *best practices*, pola arsitektur *monorepo*, dan standar operasional untuk mengelola database PostgreSQL menggunakan **Prisma ORM** di proyek SaaS Sport Management.

---

## 1. Arsitektur Monorepo (Shared Database)

Dalam proyek *monorepo* ini, Prisma ORM **TIDAK** di-install langsung di dalam aplikasi (seperti `apps/api` atau `apps/web`). Melainkan, Prisma diisolasi ke dalam satu *package* khusus:

```text
packages/db/
├── prisma/
│   ├── schema.prisma       # Sumber kebenaran utama (Single Source of Truth) database
│   └── seed.ts             # Skrip untuk memasukkan data awal (Seeder)
├ src/
│   └── index.ts            # Ekspor instance PrismaClient Singleton
├── package.json            # Bernama "@workspace/db"
└── .env                    # Koneksi database lokal (DATABASE_URL)
```

**Keuntungan:**
- Mencegah masalah koneksi ganda (*too many connections*) karena `apps/api` dan modul lain memanggil *instance* PrismaClient yang persis sama.
- Mencegah ketidakselarasan versi _client_ jika di-*deploy* ke _serverless_ atau _microservices_.

---

## 2. Pola Penulisan Skema (schema.prisma)

### 2a. Konvensi Penamaan (Naming Convention)
- **Nama Model (Prisma level):** Gunakan `PascalCase` dan bentuk **Tunggal** (Singular). Contoh: `model Siswa`.
- **Nama Tabel (Database level):** Wajib menggunakan perintah `@@map()` dengan gaya `snake_case` dan bentuk **Jamak** (Plural). Contoh: `@@map("siswa")`.
- **Nama Kolom:** Gunakan `camelCase` di Prisma, yang otomatis dipetakan Prisma secara cerdas, atau secara eksplisit gunakan `@map("nama_kolom_snake")` jika perlu konsistensi ketat dengan database eksternal lama.

### 2b. Standar Foreign Key & Relasi
Setiap relasi antartabel harus dilengkapi dengan `onDelete: Cascade` jika tabel turunan tidak lagi memiliki makna ketika *parent*-nya dihapus.

```prisma
model Absensi {
  id        String   @id @default(uuid())
  jadwalId  String
  siswaId   String
  tanggal   DateTime
  status    String   // 'hadir' | 'izin' | 'sakit' | 'alpha'

  jadwal    JadwalLatihan @relation(fields: [jadwalId], references: [id], onDelete: Cascade)
  siswa     Siswa         @relation(fields: [siswaId], references: [id], onDelete: Cascade)

  @@unique([jadwalId, siswaId, tanggal])
  @@map("absensi")
}
```

---

## 3. Prosedur Operasional & Migrasi Database

Karena keterbatasan eksekusi *script* `npx` di beberapa sistem Windows (contoh: *UnauthorizedAccess PSSecurityException*), selalu gunakan **`bunx`** untuk operasional Prisma di dalam direktori `packages/db`.

### 3a. Mendorong Perubahan ke Database
Jika Anda mengubah isi `schema.prisma` (misal menambah tabel atau kolom baru), jalankan perintah berikut dari terminal yang berada di dalam folder `packages/db`:

```bash
bunx prisma migrate dev
```
- Prisma akan membandingkan skema dengan kondisi database PostgreSQL.
- Prisma akan meminta Anda mengetikkan nama migrasi (contoh: `add_tes_fisik_table`).
- Setelah selesai, _Prisma Client_ akan otomatis di-*generate* ulang agar TypeScript langsung mengenali kolom baru tersebut.

### 3b. Pull dari Database (Reverse Engineering)
Jika ada pihak yang mengubah tabel langsung di PostgreSQL menggunakan DBeaver/pgAdmin tanpa melalui Prisma, lakukan sinkronisasi terbalik:
```bash
bunx prisma db pull
```

### 3c. Mereset Database Sepenuhnya
Jika data berantakan selama masa pengembangan (*development*), Anda dapat mereset ulang seluruh tabel. Perintah ini akan menghapus semua isi tabel dan langsung menjalankan **Seeder** awal.
```bash
bunx prisma migrate reset
```

---

## 4. Pola Pengisian Data Awal (Seeding)

Semua *Seeder* (data standar yang wajib ada saat aplikasi baru dipasang) diletakkan di `packages/db/prisma/seed.ts`.

Sistem migrasi sudah dikonfigurasi di `packages/db/package.json` untuk otomatis mengeksekusi skrip ini setelah migrasi atau *reset* berjalan:
```json
"prisma": {
  "seed": "bun run prisma/seed.ts"
}
```

**Aturan Seeding:**
- Gunakan `upsert` alih-alih `create` untuk menghindari _error duplicate_ jika seeder dijalankan berulang kali.
- Hanya masukkan entitas statis atau akun *developer* awal (contoh: Role `superadmin`, akun admin standar, atau daftar _Permissions_).
- Untuk setiap akademi baru, otomatis insert default: `master_posisi`, `kelompok_umur`, dan `master_pelanggaran`.

---

## 5. Integrasi ke Backend (NestJS)

Di dalam `apps/api` (Backend), penggunaan Prisma dilakukan dengan cara:
1. Menambahkan `@workspace/db` sebagai _dependency_.
2. Membuat `PrismaService` yang meng-_extend_ `PrismaClient` dari `@workspace/db`.

```typescript
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@workspace/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

Dengan pola ini, seluruh aplikasi menggunakan tipe data dan _client_ yang tunggal, diisolasi aman di _Root Workspace_.
