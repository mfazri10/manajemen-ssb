# 🔬 Analisis Kode (Berbasis Realita) + Roadmap Ekspansi GOR

> Dokumen ini menganalisis **kode nyata** project Manajemen SSB (branch `tenant-modules`,
> per 1 Juli 2026) — arsitektur, kekuatan, kelemahan & saran perbaikan — lalu memetakan
> **roadmap ekspansi ke bisnis Manajemen Gedung Olahraga (GOR)**: lapangan, booking, inventaris.
>
> Berbeda dari dokumen sebelumnya, analisis ini dibuat setelah membaca kode sumber aktual
> (bukan asumsi). Ringkasan: **project sudah matang & fungsional** — fokus perbaikan ada pada
> hardening, testing, dan konsistensi.

---

## 1. Arsitektur Nyata (Terverifikasi dari Kode)

| Lapisan | Teknologi | Bukti di kode |
|---|---|---|
| **Backend** | NestJS + **GraphQL code-first** (Apollo) | `app.module.ts` → `GraphQLModule.forRoot`, `autoSchemaFile` |
| **Auth** | **Better Auth** (email+password) | `config/better-auth.config.ts`, basePath `/v1/auth` |
| **Database** | **PostgreSQL** + Drizzle ORM | `@workspace/db` → `db`, `conn` (postgres.js) |
| **Multi-tenant** | **Schema-per-tenant** | `schema/public.ts` (shared) + `schema/tenant.ts`; `getTenantSchema(slug)` |
| **RBAC** | **Permission-based** (role→permission→user) | `common/guards/permissions.guard.ts`, `@Permissions()` |
| **Frontend** | Next.js 16 + React 19 + Tailwind v4 | `apps/web`, `globals.css` (oklch, tema Garuda) |
| **UI** | shadcn (radix-nova) + lucide | `components.json`, `packages/ui` |
| **State/Data** | Apollo Client + Zustand + Better Auth client | `lib/apollo-client.ts`, `store/auth-store.ts` |

**Modul backend aktif (24):** auth, user, role, menu, tenant, master-data, siswa, orang-tua,
pelatih, jadwal, absensi, spp, keuangan-evaluasi, fase-3-4, dashboard, match, notifikasi,
materi, seleksi, log-pelatih, pendaftaran, subscription, payment, audit-log.

**Progres git:** Fase 1–4 selesai (SPP, keuangan, evaluasi, turnamen, match+klasemen,
subscription, payment, notifikasi, audit log).

---

## 2. Kekuatan (Yang Sudah Bagus) ✅

1. **Arsitektur modular NestJS** — setiap domain terpisah rapi (module/resolver/service/entity/dto).
2. **Multi-tenant schema-per-tenant** — isolasi data kuat antar akademi (lebih aman dari sekadar column scoping).
3. **RBAC permission-based** — fleksibel, izin di-drive dari database (bukan enum hardcoded).
4. **GraphQL code-first** — schema auto-generate dari decorator, type-safe end-to-end.
5. **Better Auth** — session/account/verification standar, adapter Drizzle pg.
6. **Audit log & exception filter** — `GraphQLExceptionFilter` + modul `audit-log` sudah ada.
7. **Frontend lengkap** — 30+ halaman admin, portal, tema konsisten (design token oklch).
8. **Fondasi inventaris sudah ada** — modal awal untuk ekspansi GOR.

---

## 3. Kelemahan & Saran Perbaikan 🔧

### 🔴 Prioritas Tinggi (Security & Stabilitas)

| # | Temuan | Risiko | Saran |
|---|---|---|---|
| 1 | **GraphQL `playground: true`** tanpa gating env | Endpoint & schema terekspos di produksi | Set `playground: process.env.NODE_ENV !== 'production'`; matikan `introspection` di prod. |
| 2 | **CORS/origin mismatch** — `trustedOrigins` default `localhost:3001`, web bisa di 3000 | Login/session gagal / CSRF longgar | Pusatkan origin via env `FRONTEND_URL`; samakan port web & konfigurasi. |
| 3 | **Tidak ada rate limiting / helmet** | Rentan brute-force & abuse | Tambah `@nestjs/throttler` + helmet pada bootstrap. |
| 4 | **Satu koneksi DB global** (`conn`) untuk semua tenant | Beban & isolasi koneksi | Verifikasi pooling postgres.js cukup; pertimbangkan pool size & `search_path` per-request. |
| 5 | **Secret & `.env`** | Kebocoran kredensial | Pastikan `AUTH_SECRET` kuat & tidak ada default di kode; commit `.env.example` saja. |

### 🟠 Prioritas Sedang (Kualitas)

| # | Temuan | Saran |
|---|---|---|
| 6 | **Belum ada test otomatis** (hanya `packages/db/scratch/*` skrip manual) | Tambah unit test (service) + e2e GraphQL (mis. Jest + supertest). |
| 7 | **`scratch/` ter-commit** | Pindahkan ke `__tests__` atau masukkan `.gitignore`. |
| 8 | **Validasi input** | Pastikan semua input DTO tervalidasi (class-validator/zod) konsisten di seluruh resolver. |
| 9 | **N+1 query GraphQL** | Terapkan DataLoader untuk relasi (siswa→ortu, match→lineup). |
| 10 | **Observability** | Tambah structured logging + health/readiness probe untuk deployment. |

### 🟡 Prioritas Rendah (Konsistensi)

| # | Temuan | Saran |
|---|---|---|
| 11 | **Landing page publik belum ada** | ✅ **Sudah ditambahkan** di `/landing` (lihat §5). |
| 12 | **Dokumentasi API** | Ekspor schema.gql ke docs; tambah contoh query di README. |
| 13 | **CI/CD** | GitHub Actions: lint + typecheck + build + test per PR. |

---

## 4. Halaman Landing Page (Deliverable) 🎨

Ditambahkan halaman marketing publik multi-cabang olahraga:

- **Route:** `/landing` (di-bypass dari `MainLayout` agar tanpa sidebar admin).
- **File:** `apps/web/src/app/landing/page.tsx`
- **Tema:** mengikuti design token existing (emerald/gold "Garuda"), Tailwind v4, lucide icons.
- **Konten:** hero + stats, 3 cabang (⚽ Sepak Bola, 🥅 Futsal, 🏸 Bulutangkis),
  grid 6 fitur, **section teaser ekspansi GOR**, CTA, footer.
- **Aman:** hanya bergantung pada `lucide-react` + `next/link` (sudah ada), tidak menyentuh modul lain.

> Untuk menjadikannya halaman utama publik, arahkan `/` ke `/landing` bagi user yang belum login
> (opsional — saat ini `/` tetap redirect ke dashboard/login).

---

## 5. 🏟️ Roadmap Ekspansi: Manajemen Gedung Olahraga (GOR)

Visi: memperluas dari **manajemen akademi** ke **manajemen venue olahraga** (GOR, lapangan
sewa, inventaris aset) — menyasar pemilik GOR futsal/badminton/basket.

### 5.1 Mengapa Cocok dengan Arsitektur Saat Ini
- **Multi-tenant schema-per-tenant** → tiap GOR = tenant terisolasi, siap pakai.
- **RBAC permission-based** → tinggal tambah permission (`booking.create`, `lapangan.manage`).
- **Modul `inventaris` sudah ada** → tinggal diperluas untuk aset GOR.
- **Payment & subscription sudah ada** → reuse untuk pembayaran booking & membership GOR.

### 5.2 Modul Baru yang Diusulkan

| Modul | Tabel utama (tenant schema) | Fungsi |
|---|---|---|
| **GOR / Venue** | `gor`, `fasilitas`, `jam_operasional`, `staf_gor` | Profil gedung, fasilitas, jam buka, staf. |
| **Lapangan** | `lapangan`, `tipe_lapangan`, `tarif_lapangan` | Data lapangan (futsal/badminton), tarif per jam/slot, status. |
| **Booking/Reservasi** | `booking`, `booking_slot`, `booking_pembayaran` | Reservasi online, kalender slot, DP/pelunasan, pembatalan. |
| **Membership GOR** | `member_gor`, `paket_member`, `langganan_member` | Member reguler, paket langganan, diskon. |
| **Inventaris (perluasan)** | `aset_gor`, `peminjaman_aset`, `maintenance` | Aset per venue, peminjaman, jadwal perawatan, penyusutan. |
| **Laporan Venue** | (view/agregat) | Okupansi lapangan, pendapatan per lapangan/periode, jam sibuk. |

### 5.3 Alur Booking (Contoh)
1. Pengunjung buka halaman publik GOR → lihat **kalender ketersediaan** lapangan.
2. Pilih lapangan + slot jam → sistem cek konflik (`booking_slot`).
3. Bayar via payment gateway (**reuse modul `payment`**) → status `terkonfirmasi`.
4. Notifikasi ke pengunjung & staf (**reuse modul `notifikasi`**).
5. Check-in di GOR → staf tandai kehadiran; aset dipinjam via `peminjaman_aset`.

### 5.4 Tahapan Implementasi (Disarankan)
- **Fase G1 — Fondasi Venue:** tabel `gor`, `lapangan`, `tarif`; CRUD admin + halaman publik daftar lapangan.
- **Fase G2 — Booking Engine:** kalender slot, cek konflik, booking + integrasi payment.
- **Fase G3 — Membership & Inventaris:** paket member, perluasan inventaris/maintenance.
- **Fase G4 — Analitik Venue:** dashboard okupansi & revenue per lapangan; harga dinamis (peak/off-peak).

### 5.5 Pertimbangan Teknis
- **Anti double-booking:** gunakan constraint unik `(lapangan_id, tanggal, slot)` + transaksi DB.
- **Zona waktu & slot:** definisikan slot standar (mis. 60/90 menit) + buffer bersih.
- **Tarif dinamis:** tabel `tarif_lapangan` per hari/jam (weekday vs weekend, peak).
- **Reuse maksimal:** payment, notifikasi, audit-log, RBAC — jangan buat ulang.

---

## 6. Rekomendasi Urutan Kerja

1. **Hardening cepat** (§3 prioritas tinggi #1–#3): gating playground, CORS/env, throttler+helmet.
2. **Jadikan landing publik** hidup: hubungkan `/` → `/landing` untuk visitor.
3. **Mulai Fase G1** ekspansi GOR: modul `gor` + `lapangan` + halaman publik.
4. **Tambah testing & CI** paralel agar ekspansi aman.

---

*Analisis ini dibuat setelah membaca kode sumber aktual (app.module.ts, drizzle.service.ts,
better-auth.config.ts, siswa.service.ts, permissions.guard.ts, struktur apps/web & packages/db).
Perbarui saat arsitektur berubah.*
