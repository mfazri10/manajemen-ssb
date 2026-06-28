# 🏗️ Arsitektur Sistem SaaS Sport Management

Dokumen ini adalah **Master Architecture Document** yang merangkum keseluruhan desain sistem, _tech stack_, dan aliran data (data flow) untuk proyek **SaaS Sport Management**. 

---

## 1. High-Level System Architecture

Sistem SaaS Sport Management dirancang dengan pola **Client-Server** yang berfokus pada pengalaman _offline-first_ di sisi mobile, digabungkan dengan **Monorepo Workspace** untuk berbagi efisiensi kode antar platform.

```mermaid
graph TD
    %% Klien
    subgraph Clients ["Client Layer"]
        M[📱 Mobile App <br/> Expo / React Native]
        W[💻 Web Dashboard <br/> Next.js]
    end

    %% Gateway & Auth
    subgraph API_Layer ["API Layer (Backend)"]
        N[🟢 NestJS Backend]
        GQL[⚡ GraphQL Endpoint]
        BA[🔐 Better Auth]
        
        N --> GQL
        N --> BA
    end

    %% Background Jobs & AI
    subgraph Async_AI ["Async & AI Layer"]
        ING[⚙️ Inngest <br/> Event-Driven Jobs]
        LLM[🤖 LLM Provider <br/> OpenAI / Gemini]
    end

    %% Database & Eksternal
    subgraph Data_Layer ["Data Layer"]
        DB[(🐘 PostgreSQL <br/> Prisma ORM)]
        VEC[(🧠 pgvector <br/> Vector Search)]
        S3[🗄️ S3-Compatible Storage <br/> (Misal: MinIO)]
    end

    %% Relasi
    M <-->|GraphQL & REST| N
    W <-->|GraphQL & REST| N
    
    N <-->|Prisma Client| DB
    N <-->|Semantic Search| VEC
    N -.->|Trigger Events| ING
    N <-->|Prompt & Context| LLM
```

---

## 2. Technology Stack (Tech Stack)

Pemilihan teknologi difokuskan pada tipe data yang kuat (_type-safe_), performa, dan _developer experience_ yang modern.

### A. Infrastruktur & Manajemen Kode
- **Package Manager**: Bun (`bun install`, eksekusi skrip super cepat)
- **Monorepo Manager**: Turborepo (Caching pintar, eksekusi paralel)
- **Shared Libraries**: Internal packages (`@workspace/types`, `@workspace/ui`, dll)

### B. Backend (API Layer)
- **Framework Utama**: NestJS
- **API Paradigm**: GraphQL (Code-First approach)
- **Authentication**: Better Auth (dengan ekstensi Admin Plugin)
- **ORM**: Prisma v7
- **Database**: PostgreSQL (Self-Hosted / Private Server)
- **Storage**: S3-Compatible Storage (Misal: MinIO atau AWS S3)

### C. Frontend Web (Admin & Dashboard Manajemen)
- **Framework**: Next.js (App Router)
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management / Data Fetching**: Apollo Client (GraphQL)
- **Form & Validation**: React Hook Form + Zod

### D. Mobile App (Atlet & Pelatih)
- **Framework**: Expo / React Native
- **Routing**: Expo Router (File-based routing)
- **UI Styling**: Tailwind CSS (NativeWind) / StyleSheet Konstan
- **Offline Storage**: `AsyncStorage` (Mekanisme _Offline-First_)
- **State Management**: React Context / Apollo Client dengan Local Cache

### E. Background Jobs & AI (Asisten Analitik)
- **Job Orchestration**: **Inngest**. Menggantikan Redis/BullMQ untuk antrean tugas asinkron seperti mengirim _push notification_ pengingat jadwal latihan & pertandingan, tanpa perlu mengelola _worker_ terpisah.
- **AI Framework**: Vercel AI SDK / LangChain.js (diintegrasikan dalam NestJS).
- **Vector Database**: **PostgreSQL `pgvector`**. Mengaktifkan ekstensi `pgvector` secara mandiri (_self-hosted_) di instance PostgreSQL Anda untuk menyimpan dan mencari _embeddings_ artikel olahraga, program latihan, dan data performa.
- **Caching & Rate Limiting**: **Redis** (Self-Hosted). Dikelola secara mandiri pada infrastruktur Anda sendiri. Berguna untuk _Rate Limiting_ fitur AI agar API LLM tidak kebobolan biaya, serta menampung _session cache_.

---

## 3. Data Flow & Strategi "Offline-First" (Mobile)

Karena SaaS Sport Management mendukung aktivitas di lapangan/lapangan olahraga yang seringkali memiliki koneksi internet terbatas, aplikasi mobile **harus tetap bisa digunakan meskipun tidak ada sinyal internet** (contoh: di lapangan futsal indoor, stadion, atau area latihan outdoor).

### Pola Sinkronisasi:
1. **Local First**: Saat pengguna (Pelatih/Atlet) memasukkan data (misal: Statistik Pertandingan, Kehadiran Latihan, Catatan Performa), data disimpan lebih dulu secara lokal di HP (`AsyncStorage` / SQLite lokal). UI langsung terupdate tanpa menunggu server.
2. **Background Sync**: Terdapat _Queue_ lokal. Jika mendeteksi koneksi internet (`NetInfo`), aplikasi akan menembak mutasi GraphQL ke backend NestJS secara _background_.
3. **Conflict Resolution**: Jika ada konflik (misalnya pelatih dan asisten pelatih mengedit data pertandingan yang sama di saat bersamaan), resolusi menggunakan _timestamp_ terbaru (Last-Write-Wins).

---

## 4. Keamanan & Hak Akses (Auth & RBAC)

Menggunakan **Better Auth**, aplikasi mengimplementasikan 2 lapis keamanan:
- **Lapis 1 (Global Role):** `SUPER_ADMIN`, `ADMIN`, `COACH`, `ATHLETE`.
  - `SUPER_ADMIN` mengakses Web Next.js untuk manajemen seluruh tenant (SaaS multi-tenant).
  - `ADMIN` mengakses Web Next.js untuk manajemen klub/organisasi.
  - `COACH` mengakses Mobile App dan Web Dashboard untuk mengelola latihan & pertandingan.
  - `ATHLETE` mengakses Mobile App untuk melihat jadwal, statistik, dan komunikasi.
- **Lapis 2 (Tenant & Team-Based Access):**
  - Setiap **Klub/Organasi** adalah _tenant_ yang terisolasi datanya.
  - **Admin Klub** mengundang Pelatih dan Atlet melalui Link/Kode undangan.
  - Database membuat _record_ di tabel `TEAM_MEMBERS`.
  - Backend NestJS menggunakan _Guard_ untuk memverifikasi apakah pengguna memiliki akses aktif ke tenant/team tertentu sebelum merespon _query_ GraphQL.

---

## 5. Ringkasan Dokumen Rujukan

Arsitektur ini didukung oleh detail implementasi yang telah dibakukan dalam dokumen-dokumen berikut di direktori root:

1. 📂 **Struktur Monorepo**: `monorepo-pattern.md`
2. 📱 **Standar Mobile Expo**: `mobile-pattern.md`
3. 💻 **Standar Web Next.js**: `frontend-pattern.md`
4. ⚙️ **Standar API NestJS**: `backend-pattern.md`
5. 🗄️ **Desain Database (Prisma)**: `erd-database-sport-management.md`
6. 🔐 **Autentikasi & Multi-Tenant**: `rbac-web-pattern.md`
7. ✨ **Pemetaan Fitur Mobile**: `fitur-mobile-sport-management.md`

---

### Prinsip Utama Pengembangan (Core Tenets)
1. **Type-Safety End-to-End**: Skema database (Prisma) ➡️ Tipe GraphQL (NestJS) ➡️ Client Hooks (Apollo). Perubahan di DB akan melempar error di _compile time_ frontend jika ada properti yang hilang.
2. **Feature-Sliced Design**: Setiap kode dikelompokkan berdasarkan **fitur** (domain bisnis), bukan berdasarkan jenis file (seperti diatur di `mobile-pattern.md` dan `frontend-pattern.md`).
3. **Single Source of Truth**: Semua _business logic_ utama harus ada di NestJS. Mobile dan Web adalah _dumb clients_ (sebisa mungkin hanya mengelola _view logic_ dan _offline cache_).
4. **Multi-Tenant Isolation**: Setiap tenant (klub/organasi) memiliki isolasi data yang ketat di level database (_row-level security_) dan di level API (_tenant context guard_).
