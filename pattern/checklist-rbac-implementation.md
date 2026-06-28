# ✅ Checklist Implementasi RBAC & Multi-Tenant (SaaS Sport Management)

Gunakan checklist ini sebagai panduan langkah demi langkah (Step-by-Step) untuk mengimplementasikan model Autentikasi dan Hak Akses (Superadmin, Admin, Pelatih, Orang Tua) di Backend (NestJS) maupun Frontend (Next.js).

---

## Tahap 1: Setup Database & Prisma (Root/Backend)

Fokus: Mempersiapkan struktur tabel yang dibutuhkan oleh Better Auth dan sistem multi-tenant.

- [ ] Inisialisasi Prisma (`bunx prisma init`) di direktori/package database.
- [ ] Buat skema tabel Better Auth Core (Standar):
  - [ ] `User`, `Session`, `Account`, `Verification`
- [ ] Buat skema tabel Multi-Tenant:
  - [ ] Model `Akademi`: `id` (UUID), `namaAkademi`, `slug` (Unique), `paket`, `timestamps`
- [ ] Buat skema tabel Dynamic RBAC:
  - [ ] Model `Role`: `id` (Int), `name` (String, Unique), `label` (String?), `timestamps`
  - [ ] Model `Permission`: `id` (Int), `name` (String, Unique), `label` (String?), `timestamps`
  - [ ] Model `RoleUser` (Pivot): `id`, `userId` (String FK ke User), `roleId` (Int FK ke Role), `akademiId` (UUID FK ke Akademi)
  - [ ] Model `PermissionRole` (Pivot): `id`, `permissionId` (Int FK), `roleId` (Int FK)
- [ ] Buat skema tabel Domain SSB:
  - [ ] `Siswa` (Data siswa/pemain)
  - [ ] `OrangTua` (Data orang tua/wali)
  - [ ] `Pelatih` (Data pelatih)
  - [ ] `KelompokUmur` (Kelompok umur U-6 s/d U-18)
  - [ ] `JadwalLatihan` (Jadwal latihan)
  - [ ] `Absensi` (Absensi siswa)
  - [ ] `SPPTagihan` & `SPP_Pembayaran` (Keuangan)
  - [ ] `Evaluasi` (Rapor pemain)
  - [ ] `TesFisik` (Tes fisik)
  - [ ] `Turnamen`, `Match`, `MatchEvent` (Turnamen)
  - [ ] `Pengumuman` (Komunikasi)
- [ ] Buat _Seeder_ untuk mengisi data awal (contoh role `superadmin`, `admin`, `pelatih`, `orang_tua`, daftar permissions).
- [ ] Jalankan migrasi database (`bunx prisma migrate dev --name init_auth_rbac`).
- [ ] Generate Prisma Client (`bunx prisma generate`).

---

## Tahap 2: Implementasi Backend (NestJS)

Fokus: Mengonfigurasi engine Better Auth dan membuat _Guards_ untuk memvalidasi akses request.

- [ ] Install _dependencies_: `bun add better-auth @prisma/client`
- [ ] Buat file konfigurasi Better Auth (`src/auth/better-auth.config.ts`):
  - [ ] Hubungkan `prismaAdapter`
- [ ] Buat Controller untuk me-_mount_ Better Auth _handlers_ (agar endpoint `/api/auth/*` bisa diakses frontend).
- [ ] **Buat Tenant Guard** (`TenantGuard`):
  - [ ] Membaca `akademiId` dari header request.
  - [ ] Memvalidasi apakah user memiliki akses ke akademi tersebut.
  - [ ] Menyuntikkan `akademiId` ke request context.
- [ ] **Buat Permission Guard** (`PermissionsGuard`):
  - [ ] Membaca token/cookies dari request.
  - [ ] Memvalidasi session ke Better Auth.
  - [ ] Melakukan _query_ ke Prisma untuk mengecek apakah `userId` memiliki `permission` yang disyaratkan oleh _endpoint_ tersebut dalam konteks `akademiId`.
- [ ] Buat _Endpoints_ / _GraphQL Mutations_ untuk Multi-Akademi:
  - [ ] `createAkademi(data)`: Membuat akademi baru + default roles + default master data.
  - [ ] `inviteMember(email, roleId)`: Mengundang pelatih/orang tua ke akademi.
  - [ ] `acceptInvite(inviteId)`: Menerima undangan.
  - [ ] `removeMember(userId)`: Menghapus anggota dari akademi.

---

## Tahap 3: Implementasi Frontend Web (Next.js)

Fokus: Membangun UI Login dan membatasi akses ke dashboard berdasarkan role.

- [ ] Install **Client SDK**: `bun add better-auth` (Client SDK untuk memanggil server NestJS).
- [ ] Buat file _Client_ (`lib/auth-client.ts`):
  - [ ] Inisialisasi `createAuthClient({ baseURL: "URL_BACKEND_NESTJS" })`.
- [ ] Buat Halaman Autentikasi:
  - [ ] `/login`: Form Login (Email/Password).
  - [ ] `/register`: Form Pendaftaran + Buat Akademi.
- [ ] **Implementasi Middleware** (`middleware.ts`):
  - [ ] Cek session cookie.
  - [ ] Blokir akses ke URL `/admin/*` jika user belum login.
  - [ ] Redirect ke `/login` jika user belum login.
  - [ ] Blokir akses ke `/superadmin/*` jika bukan superadmin.
- [ ] **Buat Akademi Selector** (dropdown untuk memilih akademi aktif):
  - [ ] Menyimpan `akademiId` yang dipilih.
  - [ ] Mengirim `x-akademi-id` di setiap request.
- [ ] **Buat UI Wrapper Component** (`<PermissionGate>`):
  - [ ] Komponen yang membungkus tombol/menu.
  - [ ] Hanya _render_ _children_ jika user memiliki spesifik `permission` (misal: `siswa.create`).
- [ ] Buat Halaman Manajemen Admin (Contoh: `/admin/siswa` untuk melihat daftar siswa).

---

## Tahap 4: Implementasi Mobile (Expo)

Fokus: Membangun mobile app untuk pelatih dan orang tua.

- [ ] Buat halaman Login/Register.
- [ ] Buat Dashboard adaptif berdasarkan role:
  - [ ] **Pelatih**: Jadwal hari ini, input absensi, evaluasi siswa.
  - [ ] **Orang Tua**: Profil anak, kehadiran, SPP status, rapor.
- [ ] Implementasi fitur absensi (input batch oleh pelatih).
- [ ] Implementasi fitur lihat jadwal latihan.
- [ ] Implementasi notifikasi push untuk pengumuman.

---

## Tahap 5: Testing (End-to-End)

Fokus: Memastikan keamanan dan kebocoran data tidak terjadi.

- [ ] **Test 1**: Orang tua mencoba memanggil API `createSiswa` ➡️ _Harus gagal (403 Forbidden)._
- [ ] **Test 2**: Admin dengan permission `siswa.create` memanggil API ➡️ _Harus sukses._
- [ ] **Test 3**: Admin Akademi A mencoba membaca data Siswa Akademi B ➡️ _Harus gagal (403 Forbidden)._
- [ ] **Test 4**: Pelatih mencoba mengakses data keuangan (`keuangan.view`) ➡️ _Harus gagal (403 Forbidden)._
- [ ] **Test 5**: Orang tua mencoba melihat rapor anak sendiri ➡️ _Harus sukses._
- [ ] **Test 6**: Orang tua mencoba melihat rapor anak orang lain ➡️ _Harus gagal (403 Forbidden)._
