# 🗂️ Implementation Plan — Fase 0.5 & 0.6

## Konteks
Mengerjakan dua fase sekaligus yang saling berkaitan:
- **Fase 0.5** — Onboarding Multi-Produk (survey pemilihan, free trial, provisioning per jenis bisnis)
- **Fase 0.6** — UX Onboarding (demo data, checklist progresif, progressive disclosure, smart defaults, import Excel)

Notifikasi WhatsApp **di-skip** dulu, akan dikerjakan di fase berikutnya.

---

## 📦 LAYER 1 — Database (Kerjakan Pertama)
> Semua perubahan skema harus selesai sebelum backend & frontend bisa dikerjakan.

### 1.1 Modifikasi Tabel yang Sudah Ada

- [x] **`public.akademi`** — Tambah kolom `type`
  ```sql
  ALTER TABLE public.akademi
    ADD COLUMN type VARCHAR(30) DEFAULT 'akademi'
      CHECK (type IN ('akademi', 'gor', 'futsal', 'badminton',
                      'gym', 'yoga', 'pilates', 'lainnya'));
  ```
  File: `packages/db/src/schema/public.ts` → tambah field `type` ke tabel `akademi`

- [x] **`public.user_onboarding_survey`** — Tambah kolom `isCompleted`
  ```sql
  -- Jika tabel sudah ada:
  ALTER TABLE public.user_onboarding_survey
    ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;
  -- Atau sesuaikan saat buat tabel baru
  ```

### 1.2 Tabel Baru di `public` Schema

- [x] **`public.subscriptions`** — Tracking free trial & paket
  ```sql
  CREATE TABLE subscriptions (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    akademi_id  TEXT NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    plan        VARCHAR(20) DEFAULT 'trial'
                  CHECK (plan IN ('trial', 'starter', 'growth', 'pro')),
    status      VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active', 'expired', 'cancelled')),
    started_at  TIMESTAMP DEFAULT NOW(),
    expires_at  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );
  ```
  File: `packages/db/src/schema/public.ts` → tambah tabel `subscriptions`

- [x] **`public.user_onboarding_survey`** — Simpan jawaban survey
  ```sql
  CREATE TABLE user_onboarding_survey (
    id            SERIAL PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_type  VARCHAR(30) NOT NULL,
    raw_answers   JSONB,
    is_completed  BOOLEAN DEFAULT FALSE,
    completed_at  TIMESTAMP,
    UNIQUE (user_id)
  );
  ```
  File: `packages/db/src/schema/public.ts` → tambah tabel `userOnboardingSurvey`

- [x] **`public.onboarding_progress`** — Tracking checklist per user
  ```sql
  CREATE TABLE onboarding_progress (
    id           SERIAL PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step         VARCHAR(50) NOT NULL,
                  -- 'profile' | 'siswa' | 'jadwal' | 'spp' | 'done'
    completed    BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE (user_id, step)
  );
  ```
  File: `packages/db/src/schema/public.ts` → tambah tabel `onboardingProgress`

### 1.3 File SQL Template Baru

- [x] **`database/tenant_schema_template_gor.sql`** — Template untuk venue/booking
  - Tabel: `lapangan`, `slot_waktu`, `booking`, `pelanggan`, `pengeluaran_gor`
  - Index: booking per lapangan & tanggal

- [x] **`database/tenant_schema_template_fitness.sql`** — Template untuk gym/studio
  - Tabel: `member`, `paket_membership`, `kunjungan`, `kelas`, `jadwal_kelas`, `instruktur`
  - Index: kunjungan per member & tanggal

### 1.4 Update Drizzle Relations

- [x] Tambah relations di `packages/db/src/schema/public.ts`:
  - `akademiRelations` → tambah relasi ke `subscriptions`
  - `usersRelations` → tambah relasi ke `userOnboardingSurvey` & `onboardingProgress`
  - Ekspor semua tabel baru dari `packages/db/src/index.ts`

---

## ⚙️ LAYER 2 — Backend NestJS (Kerjakan Kedua)
> Semua service & resolver di NestJS setelah skema database siap.

### 2.1 Update `TenantProvisioningService`

- [x] Update method `createTenant(slug, productType)` — terima parameter `productType`
  File: `apps/api/src/modules/tenant/tenant-provisioning.service.ts`
  - Pilih template SQL berdasarkan `productType`:
    - `'akademi' | 'futsal' | 'badminton'` → `tenant_schema_template_akademi.sql`
    - `'gor'` → `tenant_schema_template_gor.sql`
    - `'gym' | 'yoga' | 'pilates'` → `tenant_schema_template_fitness.sql`
  - Seed data default sesuai tipe (seed akademi/gor/fitness masing-masing berbeda)

### 2.2 Update `TenantResolver` — `registerAkademi` Mutation

- [x] Tambah field `type` dan `productType` ke input DTO
  File: `apps/api/src/modules/tenant/tenant.resolver.ts`
  - `RegisterAkademiInput` → tambah field `type: String`
  - Setelah INSERT akademi → INSERT `subscriptions` (plan: 'trial', expires_at: NOW()+7hari)
  - Setelah INSERT akademi → INSERT `user_onboarding_survey` (productType)
  - Panggil `createTenant(slug, type)` bukan `createTenant(slug)`

### 2.3 Buat `SubscriptionService`

- [x] File baru: `apps/api/src/modules/subscription/subscription.service.ts`
  - Method: `createTrial(akademiId)` → INSERT ke `subscriptions`
  - Method: `getStatus(akademiId)` → return status trial (active/expired + sisa hari)
  - Method: `isExpired(akademiId)` → boolean

- [x] File baru: `apps/api/src/modules/subscription/subscription.resolver.ts`
  - Query: `mySubscription` → return status & sisa hari trial
  - Query: `subscriptionStatus(akademiId)` → untuk admin dashboard

### 2.4 Buat `OnboardingService`

- [x] File baru: `apps/api/src/modules/onboarding/onboarding.service.ts`
  - Method: `getProgress(userId)` → return semua step + status completed
  - Method: `completeStep(userId, step)` → mark step sebagai selesai
  - Method: `isOnboardingDone(userId)` → boolean

- [x] File baru: `apps/api/src/modules/onboarding/onboarding.resolver.ts`
  - Query: `myOnboardingProgress` → return array `{ step, completed, completedAt }`
  - Mutation: `completeOnboardingStep(step: String!)` → mark step selesai

### 2.5 Buat `SiswaImportService`

- [x] File baru: `apps/api/src/modules/siswa/siswa-import.service.ts`
  - Method: `parseExcel(buffer, tenantSlug)` → parse file Excel → return preview data
  - Method: `importSiswa(data[], tenantSlug)` → INSERT batch ke tenant schema
  - Endpoint REST: `POST /v1/siswa/import` (multipart/form-data)

### 2.6 Daftarkan Modul Baru

- [x] `apps/api/src/modules/subscription/subscription.module.ts` → buat & daftarkan
- [x] `apps/api/src/modules/onboarding/onboarding.module.ts` → buat & daftarkan
- [x] Import ke `apps/api/src/app.module.ts`

---

## 🎨 LAYER 3 — Frontend Next.js (Kerjakan Ketiga)
> Semua UI setelah backend API siap.

### 3.1 Halaman Survey Pemilihan Produk (BARU)

- [x] File: `apps/web/src/app/onboarding/survey/page.tsx`
  - Layout: 3 kartu besar (Akademi / Venue Booking / Fitness & Studio)
  - Setelah pilih → animasi expand → pilih sub-kategori (SSB? Badminton? Karate?)
  - Submit → simpan ke survey → redirect ke `/register/academy`
  - Guard: jika survey sudah diisi → skip langsung ke `/register/academy`

### 3.2 Update Halaman Register Academy

- [x] File: `apps/web/src/app/register/academy/page.tsx`
  - Tambah field tersembunyi `type` yang diisi dari hasil survey
  - Update mutation `registerAkademi` → kirim parameter `type`
  - Update redirect logic: register → survey → daftar akademi → dashboard

### 3.3 Demo Data & Banner

- [x] File baru: `apps/web/src/lib/demo-data.ts`
  - Export `getDemoData(productType)` → return data dummy realistis per tipe
  - Data per tipe: akademi (siswa, jadwal, absensi demo), gor (lapangan, booking demo)

- [x] Komponen baru: `apps/web/src/components/DemoBanner.tsx`
  - Banner kuning/oranye di atas dashboard: "🎮 Mode Demo — Klik di sini untuk mulai input data nyata"
  - Tampil hanya jika `onboardingProgress.steps.length === 0`

### 3.4 Onboarding Checklist (Floating Card)

- [x] Komponen baru: `apps/web/src/components/OnboardingChecklist.tsx`
  - Floating card kanan bawah layar
  - Progress bar (X/5 selesai)
  - Setiap item: ikon status + label + tombol "Mulai →"
  - Animasi ✅ + confetti saat step selesai (`canvas-confetti`)
  - Auto-collapse & hilang setelah semua step selesai
  - Render di `MainLayout.tsx` agar muncul di semua halaman admin

### 3.5 Progressive Disclosure — Sidebar

- [x] Hook baru: `apps/web/src/hooks/useMenuAccess.ts`
  - Query GraphQL: `myOnboardingProgress`
  - Return: `{ canAccessAbsensi, canAccessKeuangan, canAccessEvaluasi, ... }`

- [x] Update: `apps/web/src/components/Sidebar.tsx`
  - Import `useMenuAccess`
  - Menu yang locked: style abu-abu + ikon 🔒 + tooltip "Selesaikan setup dasar"
  - Menu yang unlocked: tampil normal

### 3.6 Trial Banner di Dashboard

- [x] Komponen baru: `apps/web/src/components/TrialBanner.tsx`
  - Query: `mySubscription` → ambil sisa hari trial
  - Tampil banner: "⏳ Free Trial Anda: 5 hari tersisa. [Pilih Paket →]"
  - Warna: hijau (>3 hari) → kuning (≤3 hari) → merah (expired)
  - Render di `MainLayout.tsx`

### 3.7 Smart Defaults — Update Form SPP

- [x] Update: `apps/web/src/app/admin/spp/page.tsx`
  - Checkbox "Semua siswa aktif" → pre-checked secara default
  - Bulan & tahun → otomatis bulan berjalan
  - Jatuh tempo → otomatis H+10 dari hari ini
  - Nominal → dari konfigurasi akademi atau input terakhir

### 3.8 Import Siswa dari Excel

- [x] Update: `apps/web/src/app/admin/siswa/page.tsx`
  - Tambah tombol "Import dari Excel" di header
  - Modal: download template → upload file → preview data → konfirmasi import
  - Download template: file `assets/template-siswa.xlsx`

---

## 🧪 LAYER 4 — Testing & Verifikasi

- [x] Test: Registrasi akun baru → survey → daftar akademi type 'gor' → cek schema tenant berisi template GOR
- [x] Test: Registrasi akun baru → survey → daftar akademi type 'gym' → cek schema tenant berisi template fitness
- [x] Test: Login pertama → dashboard demo muncul → banner demo muncul
- [x] Test: Tambah 1 siswa → menu Absensi unlock di sidebar
- [x] Test: Buat tagihan SPP → checklist step 5 centang → confetti muncul
- [x] Test: Import Excel 10 siswa → semua tersimpan di tenant schema
- [x] Test: Trial banner tampil dengan sisa hari yang benar

---

## 📊 Urutan Prioritas Pengerjaan

```
1. Layer 1 — Database  (½ hari)
2. Layer 2.1–2.2       (½ hari) → TenantProvisioningService + registerAkademi update
3. Layer 2.3–2.4       (½ hari) → SubscriptionService + OnboardingService
4. Layer 3.1–3.2       (½ hari) → Halaman Survey + Update Register Academy
5. Layer 3.3–3.4       (½ hari) → Demo Data + Onboarding Checklist
6. Layer 3.5–3.6       (½ hari) → Progressive Sidebar + Trial Banner
7. Layer 2.5 + 3.7–3.8 (½ hari) → Import Excel + Smart Defaults SPP
8. Layer 4             (½ hari) → Testing semua alur
```

**Estimasi total: 4 hari pengerjaan fokus**

---

> **Yang di-skip untuk sekarang:**
> - Notifikasi WhatsApp (Fonnte / Meta Cloud API) → Fase berikutnya
> - Model D (Event/Komunitas) → Fase berikutnya
> - Integrasi payment gateway → Fase berikutnya
