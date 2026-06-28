# Standar dan Pattern Next.js (TypeScript)

Dokumen ini merangkum _best practices_, standar arsitektur, serta _pattern_ modern untuk pengembangan aplikasi Next.js (App Router) menggunakan TypeScript, demi menjaga kualitas _codebase_ jangka panjang dan memudahkan kolaborasi.

---

## 1. Arsitektur & Struktur Direktori

Daripada menumpuk semua kode di direktori `components`, gunakan kombinasi pendekatan berbasis turunan fungsional (**Feature-Sliced**) di dalam folder `web/`.

```text
web/
├── app/                  # File routing Next.js (page.tsx, layout.tsx, route.ts, dll)
├── components/           # UI Components yang global/general (Button, Input, Card, Modal)
├── features/             # Modul logika khusus per fitur (sangat dianjurkan untuk project besar)
│   ├── authentication/
│   │   ├── components/   # Komponen UI spesifik untuk modul login/register
│   │   ├── hooks/        # Custom hooks spesifik otentikasi
│   │   ├── actions.ts    # Server Actions murni untuk otentikasi
│   │   └── types.ts      # Type definintions terkait auth
│   ├── siswa/
│   │   ├── components/   # SiswaCard, SiswaForm, SiswaTable
│   │   ├── hooks/        # useSiswa.ts
│   │   ├── actions.ts    # Server Actions CRUD siswa
│   │   └── types.ts      # Tipe spesifik siswa
│   ├── keuangan/
│   │   ├── components/   # SPPTagihanCard, BukuKasTable
│   │   ├── hooks/        # useKeuangan.ts
│   │   ├── actions.ts    # Server Actions keuangan
│   │   └── types.ts
│   └── absensi/
│       ├── components/   # AbsensiForm, AbsensiTable
│       ├── hooks/        # useAbsensi.ts
│       ├── actions.ts    # Server Actions absensi
│       └── types.ts
├── lib/                  # Konfigurasi Pihak ke-3 & helper eksternal (dbClient, apollo, dll)
├── types/                # Definisi TypeScript global (hindari menaruh type spesifik disini)
└── utils/                # Helper / fungsi utilitas kecil murni (formatDate, formatCurrency)
```

**Rekomendasi:** Selalu pertahankan folder `app/` agar sebersih mungkin. Hanya simpan logika _routing_, deklarasi halaman (`page.tsx`), dan pemuatan data tingkat tinggi (_server-fetching_) di sana. Usahakan pendenlegasian visual diturunkan ke `components/` atau `features/`.

---

## 2. Pola Penulisan Komponen (Server vs Client)

Sebagai _default_, di Next.js dengan arsitektur _App Router_, seluruh komponen adalah **Server Component**.

### Server Components (SC)

Gunakan _Server Component_ untuk kasus di mana Anda butuh _backend access_, performa respons cepat (HTML langsung di-render HTML), dan untuk _Search Engine Optimization_ (SEO).

- Akses dan memuat data (fetch) langsung dari database atau sistem eksternal internal.
- Menjaga hal-hal yang bersifat rahasia (_API keys_, dll).

### Client Components (CC)

Tandai komponen menggunakan arahan `"use client"` di baris no 1. Hanya gunakan ini bila:

- Komponen menggunakan _state_ dan sekuritas siklus hidup (`useState`, `useEffect`, `useReducer`).
- Butuh interaksi langsung dari user (`onClick`, `onChange`).
- Perlu mengakses API interaksi DOM bawaan klien (seperti `window`, `localStorage`).

**Pattern Terbaik ("Leave the Leaves to Client"):**  
Jangan jadikan satu layout/page keseluruhan sebagai `Client Component`. Isolasi _state_ sejauh mungkin ke bawah hierarki komponen.

```tsx
// ❌ HINDARI: Menjadikan satu Page menjadi Client Component
"use client"
import StaticNavbar from "@/components/StaticNavbar";
import { useState } from "react";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <StaticNavbar /> {/* Akan dirender di sisi client, bundle membesar */}
      <Button onClick={() => setIsOpen(true)}>Buka Pilihan</Button>
    </div>
  )
}

// ✅ REKOMENDASI: Isolasi Client Component ke komponen khusus
import StaticNavbar from "@/components/StaticNavbar";
import SiswaFilterDropdown from "@/features/siswa/components/SiswaFilterDropdown";

export default function Page() {
  return (
    <div>
      <StaticNavbar /> {/* Tetap menjadi Server Component */}
      <SiswaFilterDropdown /> {/* Hanya komponen ini yang memakai 'use client' */}
    </div>
  )
}
```

---

## 3. Standar Kebersihan TypeScript

- **Wajib `strict: true`**: Tetap pastikan file `tsconfig.json` memiliki status setingan kompilasi berjenis ketat (strict).
- **Interface vs Type**:
  - Gunakan `interface` mendefinisikan bentuk props komponen (_object_ terstruktur yang rentan diekstensi di masa depan).
  - Gunakan `type` variasi tipe (union, tupel, dll) contohnya `type StatusSiswa = "aktif" | "alumni" | "nonaktif"`.
- **Cegah Penggunaan `any`**:
  - Jangan gunakan tipe sakti `any`. Jika respons pihak ketiga belum dinamis, definisikan dengan tipe `unknown` lalu gunakan validasi eksternal Zod.

**Pattern Props Standar:**
Contoh mendefinisikan properti komponen:

```tsx
import type { ReactNode } from "react";

export interface CardProps {
  title: string;
  description?: string; // Tanda tanya untuk elemen opsional
  children: ReactNode;  // Gunakan ReactNode untuk element pembungkus
}

export function Card({ title, description, children }: CardProps) {
    return (
        <div>
           <h2>{title}</h2>
           {description && <p>{description}</p>}
           {children}
        </div>
    )
}
```

---

## 4. Pola Mengambil Data & Melakukan Perubahan Server

1. **Memuat Data (_Read/Query_)**:  
   Gunakan struktur deklarasi pemanggilan `async/await` murni dari fitur integrasi native _Next.js 14/15/16_ (`fetch`). Diusahakan untuk tidak melakukan _Data Fetching_ dari sisi client (`onClick` / `useEffect`) apabila datanya bisa diambil dari parameter URL atau Server Component.

2. **Perubahan Data Server (_Write/Mutations_)**:  
   Wajib menggunakan utilitas **Server Actions**. Simpan sekumpulan fungsi di sebuah file terpisah (contoh `actions.ts`) di mana bagian kodenya wajib menyematkan label atas `"use server"`.

---

## 5. Rekomendasi Libraries Penunjang Modern (Tech Stack Teruji)

Apabila mengembangkan proyek _large scaling / Enterprise_ dalam ekosistem Next.js TypeScript, berikut ini opsi pattern paling direkomendasikan dan kokoh.

### A. Validasi Skema / Data -> **Zod**

Wajib melengkapi antarmuka sistem yang berurusan langsung dengan masukan/API external yang tidak stabil dengan Zod. Mengkonversi Type _script_ saja pada _runtime production_ itu tidak berlaku.

```typescript
import { z } from "zod";

export const CreateSiswaSchema = z.object({
  namaLengkap: z.string().min(2, "Nama minimal 2 karakter").max(100),
  tanggalLahir: z.string().date(),
  posisiId: z.string().uuid().optional(),
  kelompokUmurId: z.string().uuid().optional(),
});

export type CreateSiswaInput = z.infer<typeof CreateSiswaSchema>;
```

### B. Form Kompleks Terkelola -> **React Hook Form + Zod**

Manajemen formulir (pendaftaran siswa, input evaluasi) yang meminimalisir re-render ketimbang menggunakan varian form tipe useState bawaan.
Bungkus `react-hook-form` beserta penyesuai pengaitan dari validasinya ke Zod (`@hookform/resolvers/zod`).

### C. Abstraksi dan Penggabung Class HTML CSS -> **clsx + tailwind-merge**

Wajib mencegah _bug styling_ bila kelas CSS utility berbentrokan / digabung kondisional secara asinkron. Abstraksi helper penulisan ini biasa disebut file pengelola string `cn`.

```tsx
// web/utils/cn.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Implementasi kondisional pada komponen
<div className={cn("bg-green-500 rounded p-4", props.isActive && "bg-blue-500 uppercase")} />
```

### D. Manajemen State Lokal Global -> **Zustand**

Hindari sistem rumit semacam _Redux_ yang butuh `Store Provider Provider` tingkat tinggi jika konteks data terbatas (Hanya berlaku untuk `client`).
Pengembang komunitas mayoritas memilih **Zustand** yang dapat memecahkan sinkronisasi kompleks state client dengan beban penulisan minimal dan _clean pattern_.

### E. _Server State Synchronization_ Khusus Klien -> **TanStack Query** _(Opsional)_

Sejauh ini pendelegasian komponen Next JS _App Router Server Actions & Server Component_ sangatlah mumpuni. Namun khusus kasus UI kompleks, misalnya _polling data kehadiran siswa secara periodik_ di sisi client, sangat cocok didelegasikan secara tangguh di sisi klient menggunakan TanStack Query (React Query).
