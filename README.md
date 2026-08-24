# SaaS Sport Management Monorepo

Projek monorepo ini dibangun menggunakan workspace Bun dan Turbo, yang mengintegrasikan aplikasi web Next.js, backend NestJS API (dengan GraphQL & Better Auth), serta aplikasi mobile Expo.

## Struktur Folder

```
saas-sport-management/
├── apps/
│   ├── api/          # NestJS API (GraphQL, Better Auth)
│   ├── mobile/       # Expo Mobile App (React Native)
│   └── web/          # Next.js Web App (TailwindCSS & Shadcn UI)
├── packages/
│   ├── db            # Prisma ORM (Shared Database)
│   ├── eslint-config # Shared ESLint Configuration
│   ├── tsconfig      # Shared TypeScript Configuration
│   ├── types         # Shared Type Definitions
│   ├── utils         # Shared Pure Utilities
│   └── ui            # Shared UI Components (Shadcn UI)
├── package.json      # Konfigurasi workspace monorepo
└── turbo.json        # Konfigurasi build pipeline Turbo
```

---

## Prasyarat (Prerequisites)

- **Bun**: Disarankan menggunakan Bun sebagai runtime dan package manager utama projek ini.
  ```bash
  npm install -g bun
  ```

---

## Cara Memulai Pengembangan (Getting Started)

### 1. Instalasi Dependensi

Jalankan perintah ini di root folder untuk menginstal seluruh dependensi di semua sub-projek secara efisien:

```bash
bun install
```

### 2. Menjalankan Server Pengembangan (Dev Mode)

Untuk menjalankan semua aplikasi secara paralel:

```bash
bun dev
```

Atau Anda bisa menjalankan aplikasi tertentu secara spesifik:

- **NestJS API**: `bun --filter api dev` (atau ke folder `apps/api` dan jalankan `bun start:dev`)
- **Next.js Web**: `bun --filter web dev`
- **Expo Mobile**: `bun --filter mobile start`

---

## Skrip Penting Monorepo (Root Workspace)

Semua skrip di bawah dapat dijalankan langsung di folder utama (root):

- `bun dev` - Menjalankan semua aplikasi dalam mode pengembangan.
- `bun run build` - Membangun semua aplikasi untuk versi produksi.
- `bun run lint` - Memeriksa style penulisan kode di seluruh monorepo.
- `bun run format` - Merapikan format kode menggunakan Prettier.
- `bun run typecheck` - Memverifikasi kesesuaian tipe data TypeScript di seluruh monorepo.

---

## Panduan Khusus Sub-Projek

### Web App (Next.js & Shadcn UI)

Untuk menambahkan komponen Shadcn UI ke aplikasi `web`, jalankan perintah berikut di folder root:

```bash
bunx shadcn@latest add button -c apps/web
```

Komponen Shadcn UI ditempatkan di `apps/web/src/components/ui` (lihat `apps/web/components.json`). Untuk menggunakannya pada aplikasi Next.js, gunakan alias `@/`:

```tsx
import { Button } from "@/components/ui/button";
```

> Catatan: folder `packages/ui` saat ini belum berisi komponen; seluruh komponen UI web berada di `apps/web/src/components/ui`.

### Backend API (NestJS)

API backend menggunakan **GraphQL (Apollo Driver)** dengan pendekatan code-first dan dilengkapi library auth **Better Auth**.

- **GraphQL Playground**: Aktif di `http://localhost:3000/graphql` saat server berjalan.
- Konfigurasi TypeScript dan ESLint meminjam konfigurasi global monorepo (`@workspace/typescript-config` dan `@workspace/eslint-config`).

### Mobile App (Expo)

Aplikasi mobile berbasis Expo dengan TypeScript dan dukungan CSS modules.

- Jalankan simulator Android: `bun --filter mobile android`
- Jalankan simulator iOS (hanya MacOS): `bun --filter mobile ios`

### Database (Prisma)

Operasional database dilakukan dari folder `packages/db`:

- `bunx prisma migrate dev` — Jalankan migrasi
- `bunx prisma db pull` — Sinkronisasi dari database
- `bunx prisma migrate reset` — Reset database + seed
- `bunx prisma studio` — Buka Prisma Studio (GUI)
