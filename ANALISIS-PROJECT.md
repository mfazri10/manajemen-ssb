# Analisis Project: Manajemen Sekolah Sepak Bola (SSB)

> 📅Tanggal: 25 Juni 2026
> 👤Author: Fazri
> 📂Repo: [manajemen-ssb](https://github.com/mfazri10/manajemen-ssb)

---

## 1. Latar Belakang

Sekolah Sepak Bola (SSB) adalah unit pembinaan usia dini yang menjadi fondasi ekosistem sepakbola Indonesia. Berdasarkan data dari berbagai jurnal dan riset, mayoritas SSB di Indonesia masih mengelola operasionalnya secara manual — menggunakan buku tulis, spreadsheet Excel, atau WhatsApp group untuk komunikasi.

**Fakta dari riset:**
- SSB Indonesia Muda Purwokerto belum memiliki sistem informasi manajemen untuk memudahkan pengunjung, siswa, dan admin (elibrary.bsi.ac.id)
- SSB di Bojonegoro masih mencatat data siswa dalam buku atau spreadsheet, dan pihak asosiasi tidak memiliki platform untuk memantau keaktifan serta perkembangan SSB (repository.unugiri.ac.id)
- Manajemen POAC (Planning, Organizing, Actuating, Controlling) di banyak SSB belum terimplementasi dengan baik (ejournal.tsb.ac.id)

---

## 2. Rumusan Masalah

Berdasarkan analisis jurnal dan studi kompetitor, berikut masalah utama yang dihadapi SSB:

### 2.1 Masalah Operasional
| No | Masalah | Dampak |
|----|---------|--------|
| 1 | Pendaftaran siswa masih manual (datang langsung, isi form kertas) | Kurang efisien, data rentan hilang |
| 2 | Absensi dicatat di buku tulis | Sulit rekap, tidak bisa monitoring real-time |
| 3 | Jadwal latihan diumumkan via WA group | Tidak terstruktur, mudah tenggelam |
| 4 | Data siswa tersebar di banyak tempat | Sulit mencari, tidak ada single source of truth |
| 5 | Komunikasi dengan orang tua tidak terdokumentasi | Informasi hilang, tidak ada jejak |

### 2.2 Masalah Keuangan
| No | Masalah | Dampak |
|----|---------|--------|
| 1 | Pembayaran SPP dicatat manual | Tidak ada reminder, tunggakan tinggi |
| 2 | Laporan keuangan tidak real-time | Sulit monitoring arus kas |
| 3 | Tidak ada sistem invoice otomatis | Proses penagihan lambat |

### 2.3 Masalah Pembinaan
| No | Masalah | Dampak |
|----|---------|--------|
| 1 | Tidak ada sistem evaluasi/rapor pemain | Perkembangan pemain tidak terukur |
| 2 | Data turnamen & prestasi tidak terdokumentasi | Portofolio akademi lemah |
| 3 | Kurikulum latihan tidak terstandardisasi | Kualitas pembinaan tidak konsisten |

---

## 3. Studi Literatur & Referensi

### 3.1 Jurnal Akademik

| No | Judul | Sumber | Temuan Utama |
|----|-------|--------|--------------|
| 1 | Sistem Manajemen SSB dan Kompetisi Bolasoft | UNDIP (ejournal.undip.ac.id) | Mengadopsi kurikulum Filanesia, menggunakan metode RAD. Bolasoft menjadi solusi manajemen SSB + turnamen |
| 2 | Analisis Manajemen di SSB Bina Putra Wonosobo | ejournal.tsb.ac.id | Menganalisis fungsi POAC. Manager, pelatih, orang tua, dan pemain sebagai subjek |
| 3 | Manajemen Pengelolaan SSB Benteng Muda IFA | UNNES (journal.unnes.ac.id) | Studi manajemen pengelolaan SSB berbasis akademi |
| 4 | Manajemen Pembinaan SSB U-13-15 di Juwana | UPGRIS (journal.upgris.ac.id) | Metode kualitatif survey, fokus pembinaan usia 13-15 tahun |
| 5 | Analisis Manajemen Sepakbola Usia Dini - Negaroa FA | Undiksha (ejournal.undiksha.ac.id) | Fungsi manajemen pengelolaan belum terlihat jelas, perlu evaluasi |
| 6 | Analisis Manajemen SSB: Perspektif Industri Olahraga | UNG (ejurnal.ung.ac.id) | Promosi via social media, turnamen usia dini. Perlu pengelolaan aspek pemasukan & pengeluaran |
| 7 | SIM SSB Indonesia Muda Purwokerto | BSI (elibrary.bsi.ac.id) | Sistem informasi manajemen berbasis web untuk memudahkan akses informasi |
| 8 | SIM SSB Mandala Majalengka | UDB (ojs.udb.ac.id) | Fitur: pendaftaran online, pengelolaan data nilai, data kegiatan, jadwal latihan |

### 3.2 Kurikulum Filanesia (PSSI)

PSSI melalui High Performance Unit telah merumuskan **Filosofi Sepak Bola Indonesia (Filanesia)** yang dituangkan dalam *Buku Kurikulum Pembinaan Sepakbola Indonesia* (2017).

**Poin penting Filanesia:**
- Formasi belajar: 1-4-3-3
- Prinsip permainan dasar & spesifik (attacking & defending)
- Model sesi latihan sesuai tahapan pembinaan usia muda
- Fondasi karakter sepakbola Indonesia dari usia dini hingga profesional

> Referensi: [pssi.org/development/philosophy](https://www.pssi.org/development/philosophy)

---

## 4. Analisis Kompetitor

### 4.1 Platform Indonesia

| Platform | Fitur Utama | Harga | Kelebihan | Kekurangan |
|----------|-------------|-------|-----------|------------|
| **Kita Juara** (kitajuara.id) | Siswa, absensi, jadwal, keuangan SPP, rapor, turnamen, pendaftaran online, multi-tenant | Gratis (≤20 siswa), Rp 99rb/bulan | Lengkap, dibangun untuk konteks Indonesia, multi-tenant | Relatif baru, fitur terbatas di paket gratis |
| **GRIIS** (griis.id) | Siswa, SPP, keuangan, absensi, rapor, jadwal, turnamen | Gratis (standard), premium berbayar | Mobile-friendly, ringan, 24/7 support | Informasi pricing kurang transparan |
| **Inscout** (app.inscout.id) | Manajemen latihan, perkembangan pemain, orang tua | Tidak diketahui | Fokus pada monitoring perkembangan | Tidak ditemukan info detail |
| **Bolasoft** | Manajemen SSB + kompetisi, kurikulum Filanesia | Tidak diketahui | Mengadopsi Filanesia, ada manajemen turnamen | Berbasis jurnal, status produk tidak jelas |

### 4.2 Platform Internasional

| Platform | Fitur Utama | Harga | Kelebihan |
|----------|-------------|-------|-----------|
| **AcadifyOS** | Admissions, CRM, billing, attendance, KPI, multi-venue | Berbayar | Multi-purpose (sports, music, tuition) |
| **Vijaro** | Finance, player tracking, team management | Berbayar | Fokus football academy |
| **Classcard** | Scheduling, fee management, feedback, progress tracking | Freemium | Real-time feedback |
| **Sportomic** | Booking, multi-ground, payments, community | 0% commission | Global scale |
| **SoccerPro** | Players, operations, e-commerce, mental health | Berbayar | Termasuk mental health support |

---

## 5. Analisis Kebutuhan Sistem

### 5.1 Pemangku Kepentingan (Stakeholders)

| Role | Kebutuhan Utama |
|------|-----------------|
| **Admin/Manager** | Kelola seluruh operasional, laporan keuangan, data siswa |
| **Pelatih** | Jadwal latihan, absensi, evaluasi pemain, materi latihan |
| **Orang Tua/Wali** | Pantau perkembangan anak, info jadwal, status pembayaran |
| **Siswa/Pemain** | Info jadwal, riwayat kehadiran, rapor perkembangan |
| **Asosiasi/PSSI** | Monitoring jumlah SSB, data pemain usia dini |

### 5.2 Modul Sistem

#### Modul 1: Manajemen Data Siswa
- Profil lengkap siswa (foto, NIK, NISN, tempat/tgl lahir, alamat)
- Data orang tua/wali (nama, no. HP, email, alamat)
- Posisi bermain (GK, DF, MF, FW)
- Kelompok umur (U-6, U-8, U-10, U-12, U-14, U-16, U-18)
- Status (aktif, alumni, non-aktif)
- Riwayat klub sebelumnya
- Dokumen (akta lahir, KK, surat sehat)

#### Modul 2: Pendaftaran Online
- Form pendaftaran online (shareable link/QR)
- Upload dokumen persyaratan
- Verifikasi oleh admin
- Konfirmasi ke orang tua via WA/Email
- Pembayaran registrasi

#### Modul 3: Manajemen Pelatih
- Profil pelatih (sertifikat kepelatihan, lisensi)
- Penugasan ke kelompok umur
- Jadwal mengajar
- Evaluasi kinerja pelatih

#### Modul 4: Jadwal & Latihan
- Kalender latihan per kelompok umur
- Lokasi latihan (lapangan utama, lapangan cadangan)
- Materi latihan per sesi (sesuai Filanesia)
- Pengumuman perubahan jadwal
- Notifikasi otomatis ke siswa/orang tua

#### Modul 5: Absensi Digital
- Absensi siswa per sesi latihan
- Absensi pelatih
- Rekap harian, mingguan, bulanan
- Export ke Excel/PDF
- Alert jika siswa sering tidak hadir

#### Modul 6: Keuangan & SPP
- Tagihan SPP bulanan otomatis
- Pembayaran (transfer, QRIS, cash)
- Riwayat pembayaran per siswa
- Laporan pemasukan & pengeluaran
- Reminder otomatis untuk tunggakan
- Invoice otomatis

#### Modul 7: Rapor & Evaluasi Pemain
- Penilaian per aspek:
  - **Teknik**: passing, dribbling, shooting, heading, tackling
  - **Fisik**: kecepatan, stamina, kelincahan, kekuatan
  - **Taktik**: positioning, game reading, decision making
  - **Mental**: disiplin, kerjasama, sportivitas, leadership
- Rapor per semester
- Catatan personal dari pelatih
- Progress tracking visual (grafik perkembangan)
- Export rapor ke PDF

#### Modul 8: Turnamen & Prestasi
- Database turnamen yang diikuti
- Pendaftaran peserta turnamen
- Hasil pertandingan (skor, kartu, gol)
- Dokumentasi foto/video
- Portofolio prestasi akademi

#### Modul 9: Komunikasi & Pengumuman
- Broadcast pengumuman ke orang tua
- Pengumuman per kelompok umur
- Arsip pengumuman
- Integrasi WhatsApp (opsional)

#### Modul 10: Inventaris & Perlengkapan
- Data inventaris (jersey, bola, cone, dll)
- Pencatatan distribusi ke siswa
- Stok & pengadaan
- Tracking jersey per pemain

#### Modul 11: Laporan & Dashboard
- Dashboard ringkasan (total siswa, kehadiran, keuangan)
- Laporan keuangan (bulanan, tahunan)
- Laporan kehadiran
- Laporan perkembangan pemain
- Export ke Excel/PDF

#### Modul 12: Multi-Tenant (Opsional)
- Setiap SSB punya ruang data terpisah
- Isolasi data antar akademi
- Super admin untuk monitoring asosiasi

---

## 6. Entity Relationship Diagram (Konsep)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   SISWA     │────▶│  KELOMPOK    │────▶│   PELATIH    │
│  (pemain)   │     │    UMUR      │     │              │
└──────┬──────┘     └──────────────┘     └──────┬───────┘
       │                                        │
       ▼                                        ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  ORANG_TUA  │     │  JADWAL      │◀────│  LATIHAN     │
│  (wali)     │     │  LATIHAN     │     │  (materi)    │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  ABSENSI    │     │   PEMBAYARAN │     │  EVALUASI    │
│             │     │   (SPP)      │     │  (rapor)     │
└─────────────┘     └──────────────┘     └──────────────┘
```

### Entitas Utama:

| Entitas | Field Utama |
|---------|-------------|
| **Siswa** | id, nisn, nik, nama, tgl_lahir, jenis_kelamin, foto, posisi, kelompok_umur, status, alamat, orang_tua_id |
| **Orang_Tua** | id, nama, no_hp, email, alamat, hubungan |
| **Pelatih** | id, nama, no_hp, email, sertifikat, lisensi, foto |
| **Kelompok_Umur** | id, nama (U-6 s/d U-18), pelatih_id, jadwal |
| **Jadwal_Latihan** | id, kelompok_umur_id, tanggal, waktu_mulai, waktu_selesai, lokasi, materi |
| **Absensi** | id, jadwal_id, siswa_id, status (hadir/izin/sakit/alpha),keterangan |
| **Pembayaran** | id, siswa_id, bulan, jumlah, tanggal_bayar, metode, status, bukti |
| **Evaluasi** | id, siswa_id, tanggal, teknik, fisik, taktik, mental, catatan_pelatih, semester |
| **Turnamen** | id, nama, tanggal, lokasi, kategori_umur, hasil |
| **Turnamen_Peserta** | id, turnamen_id, siswa_id, posisi, gol, kartu |
| **Pengumuman** | id, judul, isi, target (semua/per_kelompok), tanggal, author |
| **Inventaris** | id, nama, jumlah, kondisi, kategori |

---

## 7. Analisis SWOT

### Strengths (Kekuatan)
- Pasar besar: ribuan SSB di seluruh Indonesia
- Sedikit kompetitor lokal yang benar-benar lengkap
- Kebutuhan nyata — bukan solusi yang mencari masalah
- Bisa dijadikan SaaS (multi-tenant) untuk monetisasi

### Weaknesses (Kelemahan)
- SSB umumnya memiliki budget terbatas
- Literasi digital pelatih/manager SSB bervariasi
- Perlu edukasi pasar untuk adopsi

### Opportunities (Peluang)
- Kurikulum Filanesia PSSI bisa diintegrasikan
- Potensi kerjasama dengan PSSI/Asprov
- Ekspensi ke futsal, basket, dan olahraga lain
- Marketplace perlengkapan olahraga

### Threats (Ancaman)
- Kompetitor seperti Kita Juara sudah mulai bergerak
- SSB yang sudah terbiasa dengan cara manual resisten terhadap perubahan
- Perlu maintenance & support berkelanjutan

---

## 8. Rekomendasi Tahapan Pengembangan

### Fase 1: MVP (Minimum Viable Product)
- [ ] Autentikasi & manajemen user (admin, pelatih, orang tua)
- [ ] CRUD data siswa + foto
- [ ] CRUD data pelatih
- [ ] Manajemen kelompok umur
- [ ] Jadwal latihan (kalender)
- [ ] Absensi digital
- [ ] Dashboard ringkasan

### Fase 2: Keuangan & Evaluasi
- [ ] Manajemen SPP (tagihan, pembayaran, riwayat)
- [ ] Laporan keuangan
- [ ] Rapor/evaluasi pemain (teknis, fisik, taktik, mental)
- [ ] Export laporan ke PDF/Excel

### Fase 3: Pendaftaran & Komunikasi
- [ ] Pendaftaran online (link/QR)
- [ ] Sistem pengumuman/broadcast
- [ ] Portal orang tua (pantau anak)
- [ ] Notifikasi (WA/Email)

### Fase 4: Turnamen & Inventaris
- [ ] Manajemen turnamen
- [ ] Tracking prestasi
- [ ] Manajemen inventaris
- [ ] Portofolio akademi

### Fase 5: Scale & Monetisasi
- [ ] Multi-tenant (multi-SSB)
- [ ] Super admin / asosiasi dashboard
- [ ] Sistem langganan (freemium/premium)
- [ ] API untuk integrasi pihak ketiga
- [ ] Mobile app (PWA / native)

---

## 9. Referensi

1. Bratakusuma & Ma'arifah (2024). "Sistem Manajemen SSB dan Kompetisi Bolasoft Menggunakan Metode RAD." Jurnal Sistem Informasi Bisnis, UNDIP.
2. Analisis Manajemen di SSB Bina Putra Wonosobo. Jurnal PO, ejournal.tsb.ac.id.
3. Manajemen Pengelolaan SSB Benteng Muda IFA. INAPES, UNNES.
4. Manajemen Pembinaan SSB U-13-15 di Juwana. Spirit Edukasia, UPGRIS.
5. Analisis Manajemen Sepakbola Usia Dini - Negaroa FA. JJPKO, Undiksha.
6. Analisis Manajemen SSB: Perspektif Industri Olahraga. JJSC, UNG.
7. SIM SSB Indonesia Muda Purwokerto. Tugas Akhir BSI.
8. SIM SSB Mandala Majalengka. Senatib, UDB.
9. PSSI (2017). Kurikulum Pembinaan Sepakbola Indonesia — Filanesia.
10. Kita Juara — Platform Manajemen SSB #1 Indonesia (kitajuara.id).
11. GRIIS — Aplikasi Sistem Informasi SSB (griis.id).

---

*Analisis ini dibuat berdasarkan riset dari jurnal akademik, studi kompetitor, dan analisis kebutuhan domain sekolah sepakbola di Indonesia.*
