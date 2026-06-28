# Standar dan Pattern Monorepo SaaS Sport Management (Turborepo + Bun)

Dokumen ini menjelaskan arsitektur monorepo SaaS Sport Management: bagaimana **frontend** (Next.js), **backend** (NestJS), dan **mobile** (Expo) berbagi dependency, konfigurasi, tipe data, dan komponen UI secara efisien menggunakan **Turborepo** dan **Bun Workspaces**.

---

## 1. Gambaran Besar Struktur Monorepo

```text
saas-sport-management/                  # Root monorepo
│
├── apps/                               # Aplikasi yang di-deploy
│   ├── web/                            # Next.js — dashboard web / admin
│   ├── api/                            # NestJS + GraphQL — REST/GraphQL API
│   └── mobile/
│       └── sport-mobile/               # Expo — aplikasi mobile iOS & Android
│
├── packages/                           # Shared packages (internal libraries)
│   ├── db/                             # @workspace/db — Prisma ORM (shared database)
│   ├── ui/                             # @workspace/ui — shared UI components (web only)
│   ├── types/                          # @workspace/types — shared type definitions
│   ├── utils/                          # @workspace/utils — shared pure utilities
│   ├── validators/                     # @workspace/validators — shared Zod schemas
│   ├── typescript-config/              # @workspace/typescript-config — tsconfig bersama
│   └── eslint-config/                  # @workspace/eslint-config — ESLint rules bersama
│
├── package.json                        # Root workspace config (Bun Workspaces)
├── turbo.json                          # Turborepo task pipeline
└── bun.lock                            # Lockfile bersama (satu untuk semua workspace)
```

**Workspace naming convention:** Semua internal package menggunakan prefix `@workspace/` (bukan nama npm publik).

---

## 2. Cara Kerja Bun Workspaces

Semua `apps/*` dan `packages/*` terdaftar sebagai workspace di root `package.json`:

```json
// package.json (root)
{
  "name": "saas-sport-management",
  "packageManager": "bun@1.3.14",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

Ini berarti:
- `bun install` dijalankan **sekali di root** — semua dependency ter-install untuk semua workspace
- Satu `bun.lock` untuk seluruh monorepo — versi terjamin konsisten
- Internal packages bisa di-import langsung dengan nama `@workspace/<nama>`

---

## 3. Turborepo: Task Pipeline

Turborepo mengatur urutan eksekusi task dan caching otomatis:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],     // Build packages/* dulu sebelum apps/*
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,              // Dev server tidak di-cache
      "persistent": true           // Tetap berjalan (tidak auto-exit)
    },
    "lint": { "dependsOn": ["^lint"] },
    "typecheck": { "dependsOn": ["^typecheck"] }
  }
}
```

### Menjalankan semua app sekaligus:

```bash
# Jalankan semua dev server (web + api + mobile) bersamaan
bun run dev

# Build semua (packages di-build duluan otomatis)
bun run build

# Typecheck semua workspace
bun run typecheck

# Hanya jalankan satu app
turbo dev --filter=api
turbo dev --filter=sport-mobile
turbo dev --filter=web
```

---

## 4. Shared Packages yang Ada

### 4a. `@workspace/db` — Shared Database (Prisma ORM)

Package database terpusat. Prisma Client di-export dari sini, sehingga semua app menggunakan tipe data yang sama.

```text
packages/db/
├── prisma/
│   ├── schema.prisma       # Single Source of Truth database
│   └── seed.ts             # Seeder data awal
├── src/
│   └── index.ts            # Export PrismaClient singleton
└── package.json
```

### 4b. `@workspace/typescript-config`

Konfigurasi TypeScript bersama. Setiap app **extends** dari sini — tidak membuat tsconfig dari nol.

```text
packages/typescript-config/
├── base.json           # Dasar untuk semua — strict mode, ES2022
├── nextjs.json         # Extends base + plugin Next.js
└── react-library.json  # Extends base + JSX, untuk packages React
```

**Cara pakai di setiap app:**

```json
// apps/api/tsconfig.json — Backend NestJS
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

```json
// apps/web/tsconfig.json — Frontend Next.js
{
  "extends": "@workspace/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```json
// apps/mobile/sport-mobile/tsconfig.json — Mobile Expo
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-native",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "paths": { "@/*": ["./*"] }
  }
}
```

**Aturan:** Jangan duplikat `compilerOptions` yang sudah ada di `base.json`. Hanya override yang benar-benar berbeda.

---

### 4c. `@workspace/eslint-config`

Aturan ESLint bersama. Tersedia 3 varian:

```text
packages/eslint-config/
├── base.js             # Aturan TypeScript universal
├── next.js             # Extends base + plugin Next.js + React
└── react-internal.js   # Extends base + React (untuk packages internal)
```

---

### 4d. `@workspace/ui` — Shared UI Components

Package UI yang sudah ada berisi komponen React (web) berbasis **shadcn/ui + Tailwind**. Ini eksklusif untuk **web & admin dashboard**, karena React Native tidak bisa pakai komponen DOM.

**Cara pakai di web:**

```typescript
// apps/web/src/components/SomeFeature.tsx
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
```

> ⚠️ **Mobile tidak bisa menggunakan `@workspace/ui`** karena komponen ini menggunakan DOM React. Mobile punya design system sendiri di `apps/mobile/sport-mobile/components/ui/`.

---

### 4e. `@workspace/types` — Shared Type Definitions

Tipe data yang digunakan di **semua app** (frontend, backend, mobile) sebaiknya didefinisikan sekali di sini.

```text
packages/types/
├── src/
│   ├── siswa.ts                  # Siswa, OrangTua, StatusSiswa, dll.
│   ├── pelatih.ts                # Pelatih, Lisensi, Jabatan
│   ├── keuangan.ts               # SPPTagihan, Pembayaran, BukuKas
│   ├── evaluasi.ts               # Evaluasi, TesFisik
│   ├── turnamen.ts               # Turnamen, Match, MatchEvent
│   ├── auth.ts                   # User, Session types
│   └── index.ts                  # Re-export semua
└── package.json
    # name: "@workspace/types"
    # exports: ".": "./src/index.ts"
```

```typescript
// packages/types/src/siswa.ts
export type StatusSiswa = 'aktif' | 'alumni' | 'nonaktif' | 'pending';
export type Posisi = 'GK' | 'DF' | 'MF' | 'FW';

export interface Siswa {
  id: string;
  akademiId: string;
  namaLengkap: string;
  namaPanggilan?: string;
  tanggalLahir: string;
  jenisKelamin?: 'L' | 'P';
  posisiId?: string;
  kelompokUmurId?: string;
  status: StatusSiswa;
  fotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrangTua {
  id: string;
  siswaId: string;
  namaOrangTua: string;
  hpOrangTua: string;
  email?: string;
}
```

**Cara pakai:**

```typescript
// apps/api/src/modules/siswa/entities/siswa.entity.ts
import type { Siswa } from '@workspace/types/siswa';

// apps/web/src/features/siswa/types.ts
import type { Siswa, StatusSiswa } from '@workspace/types/siswa';

// apps/mobile/sport-mobile/types/index.ts
export type { Siswa, OrangTua } from '@workspace/types/siswa';
```

---

### 4f. `@workspace/utils` — Shared Pure Utilities

Fungsi utilitas murni yang tidak bergantung pada platform (tanpa DOM, tanpa React Native):

```text
packages/utils/
├── src/
│   ├── date.ts                     # Format tanggal, hitung umur siswa
│   ├── format.ts                   # Format currency (Rupiah), nomor HP
│   ├── validation.ts               # Zod schemas bersama
│   └── index.ts
└── package.json
    # name: "@workspace/utils"
```

```typescript
// packages/utils/src/date.ts

/**
 * Hitung usia siswa dari tanggal lahir
 * Dipakai di: mobile (dashboard), web (admin), api (validasi kelompok umur)
 */
export function calculateAge(tanggalLahir: string): {
  years: number;
  months: number;
  label: string;
} {
  const dob = new Date(tanggalLahir);
  const today = new Date();
  const diffMs = today.getTime() - dob.getTime();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  const label = years < 1 ? `${months} bulan` : `${years} tahun`;
  return { years, months, label };
}

/**
 * Format angka ke Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
```

---

### 4g. `@workspace/validators` — Shared Zod Schemas

Validasi yang konsisten di frontend, backend, dan mobile:

```text
packages/validators/
├── src/
│   ├── siswa.schema.ts             # CreateSiswaSchema, UpdateSiswaSchema
│   ├── keuangan.schema.ts          # SPPTagihanSchema, PembayaranSchema
│   └── index.ts
└── package.json
    # name: "@workspace/validators"
```

```typescript
// packages/validators/src/siswa.schema.ts
import { z } from 'zod';

export const CreateSiswaSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  namaPanggilan: z.string().max(50).optional(),
  tanggalLahir: z.string().date(),
  tempatLahir: z.string().max(50).optional(),
  jenisKelamin: z.enum(['L', 'P']).optional(),
  posisiId: z.string().uuid().optional(),
  kelompokUmurId: z.string().uuid().optional(),
});

export type CreateSiswaInput = z.infer<typeof CreateSiswaSchema>;
```

**Cara pakai:**

```typescript
// apps/api — validasi di DTO
import { CreateSiswaSchema } from '@workspace/validators/siswa.schema';

// apps/web — validasi form dengan React Hook Form
import { CreateSiswaSchema } from '@workspace/validators/siswa.schema';
const form = useForm({ resolver: zodResolver(CreateSiswaSchema) });

// apps/mobile — validasi sebelum simpan
import { CreateSiswaSchema } from '@workspace/validators/siswa.schema';
const result = CreateSiswaSchema.safeParse(formData);
```

---

## 5. Matriks: Siapa Pakai Apa

| Package | web (Next.js) | api (NestJS) | mobile (Expo) |
|---|---|---|---|
| `@workspace/db` (Prisma) | ✅ (via API) | ✅ Full | ❌ (via API) |
| `@workspace/typescript-config` | ✅ nextjs.json | ✅ base.json | ✅ base.json |
| `@workspace/eslint-config` | ✅ next.js | ✅ base.js | ✅ react-internal.js |
| `@workspace/ui` | ✅ Full | ❌ (server) | ❌ (DOM-based) |
| `@workspace/types` | ✅ | ✅ | ✅ |
| `@workspace/utils` | ✅ | ✅ | ✅ |
| `@workspace/validators` | ✅ | ✅ | ✅ |

---

## 6. Aturan Penting: Batasan Sharing

### Yang BOLEH dibagikan (platform-agnostic)
- TypeScript config
- ESLint config
- Type definitions (`interface`, `type`)
- Zod schemas / validators
- Pure utility functions (kalkulasi tanggal, format Rupiah)
- Constants (enum values, config keys)

### Yang TIDAK BOLEH dibagikan lintas platform
| ❌ Tidak Bisa Dibagi | Alasan |
|---|---|
| `@workspace/ui` (shadcn/Radix) ke mobile | Bergantung pada DOM API |
| React Native components ke web | Bergantung pada native runtime |
| `AsyncStorage` utils ke web | Library spesifik React Native |
| NestJS decorators ke frontend/mobile | Bergantung pada Node.js runtime |
| Next.js server actions ke mobile | Bergantung pada Node.js + HTTP |
| `window`, `document`, `localStorage` | Tidak ada di React Native |

### Prinsip keamanan sharing:
```text
✅ Aman dibagi: tipe + skema + kalkulasi murni
   → Tidak bergantung pada runtime apapun

⚠️  Hati-hati: hooks React
   → Bisa dibagi antara web & mobile jika murni state logic (tanpa DOM)
   → Tidak bisa dibagi jika menyentuh localStorage, window, dll.

❌ Tidak bisa dibagi: komponen UI, storage utilities
   → Terlalu terikat pada platform spesifik
```

---

## 7. Menambahkan Package Baru

Langkah membuat internal package baru (contoh: `@workspace/types`):

```bash
# 1. Buat direktori
mkdir -p packages/types/src

# 2. Buat package.json
cat > packages/types/package.json << 'EOF'
{
  "name": "@workspace/types",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
EOF

# 3. Buat tsconfig.json
cat > packages/types/tsconfig.json << 'EOF'
{
  "extends": "@workspace/typescript-config/base.json",
  "include": ["src"]
}
EOF

# 4. Install sebagai dependency di app yang butuh
# (di root monorepo)
bun add @workspace/types --workspace=apps/web
bun add @workspace/types --workspace=apps/api
bun add @workspace/types --workspace=apps/mobile/sport-mobile
```

---

## 8. Menambahkan Dependency di App Tertentu

```bash
# Tambah di web saja
bun add <package> --cwd apps/web

# Tambah di api saja
bun add <package> --cwd apps/api

# Tambah di mobile saja
bun add <package> --cwd apps/mobile/sport-mobile

# Tambah di semua workspace (devDependency global)
bun add -D <package>  # di root
```

---

## 9. Ringkasan Arsitektur Sharing

```text
                    saas-sport-management (monorepo root)
                            │
            ┌───────────────┼───────────────┐
            │               │               │
          apps/           apps/           apps/
           web             api            mobile
        (Next.js)       (NestJS)         (Expo)
            │               │               │
            └───────────────┴───────────────┘
                            │
                        packages/
                            │
    ┌───────────┬───────────┼───────────┬──────────────┐
    │           │           │           │              │
typescript   eslint      db          ui          types/utils
 -config     -config   (Prisma)   (web saja)     (semua)
 (semua)     (semua)
```

---

## 10. Turbo Cache: Optimasi Build

Turborepo menyimpan cache hasil build. Jika tidak ada perubahan, task tidak dijalankan ulang.

```bash
# Melihat status cache
turbo build --dry

# Force re-run tanpa cache
turbo build --force

# Build hanya app tertentu dan dependensinya
turbo build --filter=web
turbo build --filter=api
```

**Outputs yang di-cache** (didefinisikan di `turbo.json`):
- `web`: `.next/**`
- `api`: `dist/**`
- `packages/ui`: output kompilasi

---

*Dokumen ini mencerminkan struktur monorepo `saas-sport-management` dengan Turborepo + Bun Workspaces. Setiap penambahan package baru harus mengikuti pola di atas dan mempertimbangkan batasan platform sebelum memutuskan apakah suatu kode bisa dibagi.*
