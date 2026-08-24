# 🎯 FRONTEND-UPDATE-PLAN — `apps/web`

Checklist pembaruan frontend SaaS Sport Management, diturunkan dari dokumen repo (`Lastfeature.md`, `ANALISIS-PROJECT.md`, `ANALISIS-KODE-REALITA.md`, `ANALISIS-BOLASOFT.md`, `ANALISIS-GRIIS-MOBILE.md`, `ANALISIS-KITAJUARA.md`, `ROADMAP.md`, `implementation_plan.md`) + audit kode per **6 Agustus 2026**.

## Cara Pakai

1. **Mulai dari P0** — selesaikan semua item 🔴 sebelum lanjut (bug kritis & link rusak).
2. **Lanjutkan P1** — library & komponen dasar; fondasi untuk P2/P3.
3. **P2 bisa paralel** — kerjakan per modul; perhatikan tag `[needs-BE]` (butuh resolver/endpoint backend dulu).
4. **P3 untuk polish** — setelah P2 stabil (beda "jalan" vs "siap produksi").
5. **P4 kapan saja** — tidak blocking.

**Tag:** `[FE-only]` = tanpa backend · `[needs-BE]` = butuh backend · `[verify]` = klaim selesai di dokumen, cek manual
**Checklist:** ganti `[ ]` → `[x]` setelah selesai + ter-test.

## Status Ringkas

> Update terakhir: **06-08-2026 (sesi 3 — final)**. P0 ✅ · P1 ✅ · hampir seluruh P2/P3 FE-only selesai, termasuk 3 modul backend baru (dokumen siswa, inventaris distribusi/mutasi, fix payment/subscription). Typecheck web & API ✅, `next build` ✅ (**53 rute** + proxy middleware aktif). Sisa 13 item = fitur besar yang butuh infra backend baru / perubahan arsitektur (lihat catatan tiap item).

| Bucket | Total | Selesai | Sisa |
|--------|-------|---------|------|
| P0 Kritis / Rusak | 11 | **11** | 0 |
| P1 Infrastruktur Wajib | 10 | **10** | 0 |
| P2 Celah Fitur (dokumen) | 24 | 15 | 9 |
| P3 UX & Polish | 8 | 7 | 1 |
| P4 Masa Depan | 6 | 3 | 3 |
| **Total** | **59** | **46** | **13** |

---

## P0 — 🔴 Kritis / Rusak — ✅ SELESAI

- [x] **Auth/session gating di `src/proxy.ts`** — proxy redirect ke `/auth/login` bila cookie session Better Auth tidak ada untuk `/admin/*`, `/portal/*`, `/affiliate/dashboard/*`. `[FE-only]`
- [x] **Mount `ThemeProvider` di `app/layout.tsx`** — `components/theme-provider.tsx` + toggle dark/light di header `MainLayout`. `[FE-only]`
- [x] **Buat halaman `/admin/orang-tua`** — CRUD lengkap memakai resolver `orangTua` yang sudah ada. `[FE-only]`
- [x] **Buat halaman `/admin/transaksi`** — agregasi arus buku kas + tagihan SPP + kartu ringkasan. `[FE-only]`
- [x] **Fix link `TrialBanner`** — diarahkan ke `/admin/langganan`. `[FE-only]`
- [x] **Wire tombol "+" quick-action di home** — navigasi ke `/admin/siswa`, `/admin/spp`, `/admin/materi`. `[FE-only]`
- [x] **Hapus entri duplikat "Inventaris"** di fallback menu `AppSidebar.tsx`. `[FE-only]`
- [x] **Extract `handleSignOut`** — `hooks/useSignOut.ts` dipakai `MainLayout` & `AppSidebar`. `[FE-only]`
- [x] **[VERIFIED] Apollo header `x-tenant-slug`** — `lib/apollo-client.ts:9-16`.
- [x] **[VERIFIED] `AkademiSelector`** — kini dirender di header `MainLayout` (sebelumnya orphan).
- [x] `[verify]` **Resolver `payment.createPayment`** — stub diperbaiki: `akademiId` resolve dari tenant; query `payments` nullable. Backend ✅.

---

## P1 — 🟠 Infrastruktur Wajib — ✅ SELESAI

- [x] **Install `zod` + `react-hook-form` + `@hookform/resolvers`**. `[FE-only]`
- [x] **Install `date-fns`**. `[FE-only]`
- [x] **Install `recharts`**. `[FE-only]`
- [x] **Tambah shadcn primitives** — `badge`, `card`, `tabs`, `avatar`, `dropdown-menu`, `popover`, `calendar`, `alert-dialog` (+ patch strict TS). `[FE-only]`
- [x] **Buat `useTenant` hook** — `hooks/useTenant.ts`. `[FE-only]`
- [x] **Ganti native `confirm()` → shadcn `AlertDialog`** — `ConfirmDialog` + `useConfirmDialog`, 28 call site dimigrasi. `[FE-only]`
- [x] **Buat komponen `ErrorBoundary`** — dipasang di `layout.tsx`. `[FE-only]`
- [x] **Buat komponen file-upload** — `components/ui/file-upload.tsx` (dipakai halaman dokumen siswa; endpoint storage fisik masih manual URL). `[needs-BE→sebagian]`
- [x] **Migrasi halaman affiliate ke Apollo** — 6 file. `[FE-only]`
- [x] **Standarisasi API URL** — tidak ada lagi hardcode `:3001`. `[FE-only]`

---

## P2 — 🟡 Celah Fitur (diwajibkan dokumen)

**Halaman hilang / dirujuk tapi tidak ada:**

- [x] ~~Buat `/admin/orang-tua`~~ → selesai di P0.
- [x] ~~Buat `/admin/transaksi`~~ → selesai di P0.
- [x] **Buat `/admin/billing`** — status langganan + riwayat pembayaran + export CSV. Backend: `langgananAkademi`/`subscribePaket` akademiId optional + resolve tenant. `[FE-only]`

**Gap "tabel DB ada, resolver/UI belum" (audit API vs frontend):**

- [x] **Halaman Dokumen Siswa** — 06-08-2026: modul backend baru `dokumen-siswa` (query/mutation + permission `dokumen-siswa.*`) + halaman `/admin/dokumen-siswa` (list per siswa, tambah, hapus, export CSV). Backend ✅.
- [x] **Halaman Inventaris Distribusi & Mutasi** — 06-08-2026: 6 operasi GraphQL baru di modul fase-3-4 (`inventarisDistribusi`, `createInventarisDistribusi`, `updateInventarisDistribusi`, `deleteInventarisDistribusi`, `inventarisMutasi`, `createInventarisMutasi`, `deleteInventarisMutasi`) + halaman `/admin/inventaris-detail` bertab Distribusi & Mutasi. Backend ✅.
- [ ] **Booking venue + Tarif Lapangan** — booking engine utuh (ketersediaan slot, konflik, tarif dinamis, pembayaran) masih belum ada; tabel `booking`/`tarifLapangan` menunggu. `[needs-BE]`
- [x] `[verify]` **UI trigger `sendWhatsApp` / `sendEmail`** — 06-08-2026: dialog "Kirim WA/Email" di `/admin/notifikasi` memanggil mutation `sendWhatsApp`/`sendEmail`. `broadcastPengumuman` tetap via alur pengumuman. `[needs-BE→selesai]`

**Fitur eksplisit dari dokumen:**

- [x] **Tampilkan nama akademi di sidebar/header** — dari `useTenant`. `[FE-only]`
- [x] **Radar chart 4-dimensi evaluasi** — 06-08-2026: panel radar (Teknik/Fisik/Taktik/Mental) per siswa di `/admin/evaluasi`, ambil evaluasi semester terbaru + kartu nilai. `[FE-only]`
- [ ] **Export rapor PDF** + grafik perkembangan per semester — butuh pipeline PDF (mis. react-pdf/Puppeteer endpoint). `[needs-BE]`
- [x] **Leaderboard tes fisik per kelompok umur** — tab "Ranking" + filter KU/jenis tes + medali top-3. `[FE-only]`
- [ ] **Perdalam UI lineup match** (visual formasi, tracking substitusi) — struktur data sudah ada di `/admin/match`; visualisasi formasi belum. `[FE-only]`
- [x] **Halaman klasemen otomatis** — 06-08-2026: `/admin/klasemen` (pilih turnamen → tabel M/Mg/S/K/GM/GK/SG/Poin terurut, highlight top-3) memakai query `klasemen` yang sudah ada. `[FE-only]`
- [x] **Alert tunggakan SPP** — banner jumlah + nominal lewat jatuh tempo di `/admin/spp`. (Status/next-run scheduler: belum, butuh query status di backend.) `[FE-only]`
- [ ] **QR check-in absensi** — butuh generator QR per siswa + scanner kamera (library QR + endpoint validasi). `[needs-BE]`
- [ ] **Kartu pemain digital** (player card: foto, data, QR) — data siswa tersedia; butuh template kartu + QR + cetak/share. `[needs-BE]`
- [ ] **Integrasi kurikulum Filanesia** di materi/evaluasi — butuh konten kurikulum terstruktur (data Filanesia). `[needs-BE]`
- [ ] **Sub-menu keuangan ala Kita Juara**: Kas Masuk, Kas Keluar, Dispensasi SPP — butuh pemisahan tipe kas + skema dispensasi di backend. `[needs-BE]`
- [x] **Tab Tes Fisik ala Kita Juara** — 06-08-2026: tab Input & Hasil, Ranking, Grafik (bar chart + tombol Cetak), Pedoman (referensi 5 tes umum). Mengakomodasi 6 fungsi Kita Juara (Print via tombol cetak). `[FE-only]`
- [ ] **Form siswa 27 field + dropdown cascading** Prov→Kab→Kec→Desa — butuh sumber data wilayah (API daerah Indonesia). `[needs-BE]`
- [x] **Padatkan dashboard** — 8 kartu + bar keuangan + line tren kehadiran + donut absensi + jadwal hari ini. `[FE-only]`
- [x] **Absensi batch** — dialog "Absensi Batch" di `/admin/absensi`. `[FE-only]`
- [ ] **Download template Excel + import massal siswa** — import/template CSV sudah ada; format `.xlsx` belum (butuh lib Excel). `[needs-BE]`
- [x] `[verify]` **Cek klaim `implementation_plan.md`** — 06-08-2026 terverifikasi: `useMenuAccess` aktif dipakai AppSidebar (progressive lock); smart defaults form SPP ada (nominal 150000, bulan berjalan, jatuh tempo tgl 10); `lib/demo-data.ts` ada namun belum dipakai UI (catatan: bisa dihubungkan ke DemoBanner bila demo mode diaktifkan). `[FE-only]`

---

## P3 — 🔵 UX & Polish

- [x] **Standarisasi loading state** — 06-08-2026: `components/page-states.tsx` (`PageLoader`/`PageEmpty`) dipakai di dashboard, portal, affiliate dashboard. `[FE-only]`
- [x] **Standarisasi empty state** — `PageEmpty` tersedia + DataTable sudah punya emptyMessage konsisten. `[FE-only]`
- [x] **Export CSV** — `lib/export-csv.ts` terpasang di siswa, buku-kas, absensi, billing, dokumen siswa. (Format .xlsx belum.) `[FE-only]`
- [x] **Rapikan label campur ID/EN** — label navigasi/judul + landing page (kategori olahraga, badge) diterjemahkan ke bahasa Indonesia. `[FE-only]`
- [x] **Grafik dashboard** — bar keuangan + line kehadiran + donut absensi. `[FE-only]`
- [x] **Cleanup `features/cms/admin/menu/`** — direktori kosong dihapus. `[FE-only]`
- [x] **Rapikan `packages/ui`** — README dikoreksi. `[FE-only]`
- [ ] **Migrasi form existing ke RHF+zod** — library terpasang; migrasi 30+ form halaman belum dilakukan (refactor besar, kerjakan bertahap per modul). `[FE-only]`

---

## P4 — ⚪ Masa Depan / Strategis

- [x] **PWA tahap 1: manifest + ikon + metadata** — `public/manifest.webmanifest`, ikon 192/512, metadata + themeColor. `[FE-only]`
- [x] **Service worker + offline dasar** — 06-08-2026: `public/sw.js` (cache-first aset statis, network-first halaman dengan fallback cache; API/auth tidak dicache) + registrasi produksi di `components/pwa-register.tsx`. `[FE-only]`
- [ ] **Perluas portal orang tua** — UX terpadu ala GRIIS (jadwal, absensi, SPP, rapor, pengumuman, turnamen dalam satu dashboard anak). `[needs-BE]`
- [x] **Flow absensi satu-tap untuk pelatih** — 06-08-2026: `/admin/absensi-cepat` (pilih sesi hari ini → tap Hadir/Izin/Sakit/Alpha per siswa → simpan; default hadir, skip yang sudah tercatat). `[FE-only]`
- [ ] **Multi-SSB** — satu akun aktif di banyak akademi tanpa kehilangan riwayat (perubahan arsitektur akun). `[needs-BE]`
- [ ] **Face-scan absensi** — P2/skip versi ANALISIS-BOLASOFT (butuh infra kamera/ML). `[needs-BE]`

---

## Lampiran

### Referensi Dokumen

| Dokumen | Kontribusi ke checklist |
|---|---|
| `Lastfeature.md` | useTenant hook, nama akademi di sidebar, radar chart, rapor PDF, leaderboard, lineup, arsitektur multi-tenant |
| `ROADMAP.md` | Grafik kehadiran/keuangan, scheduler SPP, export Excel/PDF, klasemen |
| `ANALISIS-KITAJUARA.md` | Form siswa 27 field + cascading dropdown, 7 sub-menu keuangan, 6 tab tes fisik, template Excel, kepadatan dashboard, absensi batch |
| `ANALISIS-BOLASOFT.md` | QR check-in (P0), kartu pemain digital (P1), Filanesia (P1), face-scan (P2/skip) |
| `ANALISIS-GRIIS-MOBILE.md` | PWA-first, offline, portal orang tua, absensi satu-tap, multi-SSB |
| `ANALISIS-KODE-REALITA.md` | Kekuatan frontend (30+ halaman), isu CORS/port, kebutuhan standarisasi |
| `implementation_plan.md` | Klaim fitur onboarding — sudah diverifikasi |

### Catatan Teknis

- **Next.js 16**: `src/proxy.ts` adalah pengganti resmi `middleware.ts` (auto-detected framework). Auth gating ada di sana.
- **Auth**: Better Auth cookie-based (`/v1/auth`); gating proxy berbasis cookie `*.session_token`; otorisasi sesungguhnya tetap di API (guard + permissions).
- **Port**: web dev `:3002`, `next start` `:3001`, API default `:3000` — selalu pakai `NEXT_PUBLIC_API_URL` (jangan hardcode).
- **Strict TypeScript**: `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess` aktif — komponen baru wajib lolos.
- **Fix backend yang menyertai update frontend**: (1) `payment.createPayment` + `payments` — akademiId resolve tenant; (2) `langgananAkademi` + `subscribePaket` — akademiId optional + resolve tenant; (3) modul baru `dokumen-siswa`; (4) operasi distribusi/mutasi inventaris di modul fase-3-4.
- **Sisa 13 item** umumnya butuh salah satu dari: infra backend baru (booking engine, PDF pipeline, QR, data wilayah, konten Filanesia), lib tambahan (Excel), atau perubahan arsitektur (multi-SSB). RHF-migration bisa jalan bertahap tanpa blocker.
