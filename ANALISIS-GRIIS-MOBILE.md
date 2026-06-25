# Analisis Fitur Mobile: GRIIS ID

> 📅Tanggal: 25 Juni 2026
> 🔍Sumber: Google Play, griis.id, YouTube, APKPure
> 📱Platform: Android (Native) + Web App

---

## 1. Profil Aplikasi

| Item | Detail |
|------|--------|
| **Nama** | GRIIS ID |
| **Kepanjangan** | Grass Roots Integrated Information System |
| **Package** | com.griisid |
| **Versi** | 4.62 |
| **Platform** | Android (Google Play) + Web App |
| **Target User** | Siswa usia 5-17 tahun, Admin SSB, Orang Tua |
| **Download** | 1.000+ di Google Play |
| **Harga** | Gratis (Standard) + Premium (Siswa) |
| **Deskripsi** | Sistem Informasi Akademis khusus untuk Sekolah Sepak Bola |

**Keunikan GRIIS:**
- Nama "GRIIS" = Grass Roots Integrated Information System
- Fokus pada **usia dini** sepakbola (5-17 tahun)
- 1 akun siswa bisa dipakai di **banyak SSB** (history tidak hilang saat pindah)
- 1 siswa hanya boleh punya 1 akun (menjaga konsistensi data)
- Tersedia versi **Demo** (com.griisiddemo) untuk uji coba

---

## 2. Role / Jenis User

| Role | Akses | Keterangan |
|------|-------|------------|
| **Admin SSB** | Full akses ke semua modul | Kelola data siswa, keuangan, jadwal, dll |
| **Siswa** | Lihat data diri sendiri | Absensi, raport, SPP, jadwal |
| **Orang Tua** | Pantau anak | Perkembangan, kehadiran, pembayaran |

---

## 3. Modul Aplikasi

### 3.1 Data Siswa
- Profil lengkap siswa (foto, biodata)
- Data orang tua/wali
- Status aktif/non-aktif
- Riwayat SSB sebelumnya (tidak hilang saat pindah)
- Kelompok umur

### 3.2 Absensi Siswa
- Pencatatan kehadiran per sesi latihan
- Status: hadir, izin, sakit, alpha
- Rekap kehadiran
- Monitoring oleh orang tua

### 3.3 Jadwal Latihan
- Jadwal per kelompok umur
- Hari, waktu, lokasi
- Info untuk siswa & orang tua

### 3.4 SPP (Sumbangan Pembinaan Pendidikan)
- Tagihan SPP bulanan
- Status pembayaran (lunas/belum)
- Riwayat pembayaran
- Monitoring oleh orang tua

### 3.5 Keuangan SSB
- Pemasukan & pengeluaran SSB
- Laporan keuangan
- Monitoring oleh admin

### 3.6 Raport
- Penilaian perkembangan siswa
- Riwayat raport selama di SSB
- Bisa diakses orang tua

### 3.7 Turnamen
- Data turnamen yang diikuti
- Riwayat partisipasi siswa
- Dokumentasi prestasi

### 3.8 Pelanggaran
- Catatan pelanggaran siswa
- Jenis pelanggaran
- Monitoring oleh orang tua

### 3.9 Log Pelatih
- Aktivitas pelatih
- Jadwal mengajar
- Catatan kegiatan

### 3.10 Management User
- Pengaturan akses per role
- Multi-SSB (1 akun untuk banyak SSB)

---

## 4. Arsitektur Mobile

### 4.1 Pendekatan
- **Native Android** (Java/Kotlin) — bukan hybrid/PWA
- **Web App** terpisah untuk admin/desktop
- API-based (backend terpisah dari frontend)

### 4.2 Keunggulan Native Android
- Performa lebih baik
- Akses penuh ke hardware (kamera, notifikasi, GPS)
- Pengalaman user lebih halus
- Push notification native
- Bisa di-publish ke Google Play Store

### 4.3 Kekurangan Native Android
- Hanya untuk Android (tidak ada iOS)
- Development cost lebih tinggi jika mau multi-platform
- Maintenance 2 codebase (Android + Web)

---

## 5. Perbandingan dengan Kita Juara

| Aspek | GRIIS ID | Kita Juara |
|-------|----------|------------|
| **Platform** | Android Native + Web App | Web App (SPA) saja |
| **Mobile** | ✅ Native Android | ❌ Responsive web, bukan app |
| **Target** | Siswa 5-17 tahun | Semua umur |
| **Multi-SSB** | ✅ 1 akun untuk banyak SSB | ❌ 1 akademi per akun |
| **Harga** | Gratis (Standard) | Freemium (Gratis ≤20 siswa) |
| **Download** | 1.000+ | N/A (web only) |
| **Offline** | Sebagian (native) | ❌ Butuh internet |
| **Push Notification** | ✅ Native | ❌ Tidak ada |
| **Role** | Admin, Siswa, Orang Tua | Admin, Pelatih, Siswa |
| **Fitur** | 9 modul | 9+ modul (lebih lengkap) |
| **iOS** | ❌ Tidak ada | ✅ Bisa diakses dari iOS browser |

---

## 6. Peluang Pengembangan Mobile untuk Project Kita

### 6.1 Opsi Arsitektur Mobile

| Opsi | Kelebihan | Kekurangan |
|------|-----------|------------|
| **PWA (Progressive Web App)** | 1 codebase, installable, offline, push notif | Performa terbatas, akses hardware terbatas |
| **React Native / Flutter** | 1 codebase untuk iOS + Android, native feel | Learning curve, bridge ke native |
| **Native Android + iOS** | Performa terbaik, akses full hardware | 2 codebase, cost tinggi |
| **Hybrid (Capacitor/Ionic)** | 1 codebase, akses native via plugin | Performa di bawah native |

### 6.2 Rekomendasi: **PWA dulu, Flutter nanti**

**Alasan:**
1. **PWA** — cepat develop, bisa diinstall di Android/iOS, support offline, push notification via FCM
2. **Flutter** — nanti jika butuh performa native lebih baik (animasi, kamera, GPS)
3. **Cost-effective** — 1 codebase untuk semua platform

### 6.3 Fitur Mobile yang Wajib Ada

| No | Fitur | Prioritas | Alasan |
|----|-------|-----------|--------|
| 1 | Login/Register | P0 | Dasar autentikasi |
| 2 | Dashboard (ringkasan) | P0 | Overview cepat |
| 3 | Absensi (pelatih input) | P0 | Fitur utama operasional |
| 4 | Jadwal Latihan | P0 | Info harian siswa/orang tua |
| 5 | Profil Siswa | P0 | Data diri + foto |
| 6 | Notifikasi Push | P0 | Pengumuman, jadwal, SPP |
| 7 | SPP Status | P1 | Orang tua cek pembayaran |
| 8 | Raport/Evaluasi | P1 | Orang tua pantau perkembangan |
| 9 | Pengumuman | P1 | Komunikasi SSB → orang tua |
| 10 | Turnamen | P2 | Dokumentasi prestasi |
| 11 | Keuangan (admin) | P2 | Lebih nyaman di web |
| 12 | Tes Fisik | P2 | Input di tablet/HP saat latihan |

### 6.4 Fitur Mobile Khusus (Differentiator)

| No | Fitur | GRIIS punya? | Kita Juara punya? | Kita bisa buat? |
|----|-------|-------------|-------------------|-----------------|
| 1 | Multi-SSB (1 akun banyak SSB) | ✅ | ❌ | ✅ |
| 2 | Push Notification | ✅ | ❌ | ✅ |
| 3 | Offline Mode | Sebagian | ❌ | ✅ (PWA) |
| 4 | QR Check-in Absensi | ❌ | ❌ | ✅ |
| 5 | Live Score Turnamen | ❌ | ❌ | ✅ |
| 6 | Parent Portal (dedicated) | ✅ | ❌ | ✅ |
| 7 | Photo/Video Gallery | ❌ | ❌ | ✅ |
| 8 | GPS Tracking Lokasi Latihan | ❌ | ❌ | ✅ |

---

## 7. User Flow Mobile (Contoh)

### 7.1 Flow Pelatih — Absensi
```
Login → Dashboard → Pilih Jadwal Hari Ini → Pilih Kelompok Umur
→ List Siswa → Tap Hadir/Izin/Sakit/Alpha per siswa → Simpan
→ Notifikasi ke Orang Tua: "Anak Anda hadir latihan hari ini"
```

### 7.2 Flow Orang Tua — Pantau Anak
```
Login → Dashboard Anak → Lihat:
  ├── Jadwal Latihan Berikutnya
  ├── Absensi (persentase kehadiran bulan ini)
  ├── SPP Status (lunas/belum)
  ├── Raport Terakhir
  ├── Pengumuman Terbaru
  └── Turnamen Mendatang
```

### 7.3 Flow Siswa — Cek Info
```
Login → Dashboard → Lihat:
  ├── Jadwal Hari Ini
  ├── Persentase Kehadiran
  ├── Raport
  ├── Prestasi/Turnamen
  └── Pengumuman
```

---

## 8. Kesimpulan

### Kelebihan GRIIS ID:
1. ✅ Sudah ada native Android app
2. ✅ Multi-SSB (1 akun bisa dipakai di banyak SSB)
3. ✅ History siswa tidak hilang saat pindah SSB
4. ✅ Gratis untuk SSB (standard)
5. ✅ Modul lengkap (9 modul)
6. ✅ Ada versi demo untuk uji coba

### Kekurangan GRIIS ID:
1. ❌ Tidak ada iOS app
2. ❌ Tidak ada push notification terintegrasi
3. ❌ UI/UX kemungkinan masih sederhana
4. ❌ Tidak ada fitur QR check-in
5. ❌ Tidak ada live score
6. ❌ Tidak ada offline mode penuh

### Peluang Kita:
1. 🎯 **PWA** — bisa diinstall di Android & iOS tanpa Play Store
2. 🎯 **Multi-SSB** — fitur unik yang Kita Juara tidak punya
3. 🎯 **Push Notification** — komunikasi real-time ke orang tua
4. 🎯 **QR Check-in** — absensi modern
5. 🎯 **Parent Portal** — dedicated view untuk orang tua
6. 🎯 **Offline Mode** — PWA bisa jalan tanpa internet

---

*Analisis berdasarkan data Google Play, website griis.id, dan review YouTube.*
