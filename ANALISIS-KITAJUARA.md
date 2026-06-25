# Analisis Detail: Kita Juara (kitajuara.id)

> 📅Tanggal: 25 Juni 2026
> 🔍Metode: Login langsung ke dashboard (akun Garuda Muda Academy)
> ⚠️Hanya observasi, tidak ada data yang di-insert

---

## 1. Profil Platform

| Item | Detail |
|------|--------|
| **Nama** | Kita Juara |
| **URL** | https://kitajuara.id |
| **Tagline** | Platform Manajemen Sekolah Olahraga #1 di Indonesia |
| **Dibuat oleh** | Yayasan WEFA (Wonosobo Elite Football Academy) |
| **Lokasi** | Wonosobo, Jawa Tengah |
| **Target** | Sepak bola, futsal, dan olahraga lainnya |
| **Arsitektur** | Multi-tenant SPA (Single Page Application) |
| **Statistik** | 1.000+ siswa, 30+ akademi, 2.000+ transaksi SPP |

---

## 2. Struktur Menu Dashboard

### Menu Utama (Sidebar)
| No | Menu | URL | Status | Keterangan |
|----|------|-----|--------|------------|
| 1 | Dashboard | /dashboard | ✅ Gratis | Ringkasan statistik |
| 2 | Profil Akademi | /profil-lembaga | ✅ Gratis | Data akademi |
| 3 | Daftar Siswa | /pemain | ✅ Gratis | CRUD siswa |
| 4 | Alumni | /alumni | ✅ Gratis | Data alumni |
| 5 | Absensi | /absensi | ✅ Gratis | Absensi harian |
| 6 | Pelatih | /pelatih | ✅ Gratis | CRUD pelatih |
| 7 | Jadwal | /jadwal | ✅ Gratis | Jadwal latihan |
| 8 | **Keuangan** | /keuangan | ✅ Gratis | submenu: Buku Kas, Kas Masuk, Kas Keluar, SPP Siswa, Dispensasi SPP, Tabungan, Transaksi |
| 9 | Tes Fisik | /tes-fisik | ✅ Gratis | Input & ranking tes fisik |
| 10 | Raport | /raport | 🔒 Premium | Upgrade paket diperlukan |
| 11 | Laporan Semester | /laporan-semester | 🔒 Premium | Upgrade paket diperlukan |
| 12 | Surat Menyurat | /surat | 🔒 Premium | Upgrade paket diperlukan |
| 13 | Seleksi | /seleksi | ✅ Gratis | Seleksi pemain |
| 14 | Turnamen | /turnamen | 🔒 Premium | Upgrade paket diperlukan |
| 15 | Komunikasi | /komunikasi | ✅ Gratis | Pengumuman |
| 16 | Master Data | /master-data | ✅ Gratis | Posisi & pelanggaran |
| 17 | Export Data | /export-data | ✅ Gratis | Export data |
| 18 | Update Paket | /pilih-paket | - | Upgrade langganan |
| 19 | Pengaturan | /pengaturan | ✅ Gratis | Pengaturan akun |
| 20 | Kontak Kami | /kontak | ✅ Gratis | Info kontak |

---

## 3. Detail Form & Data Per Modul

### 3.1 Daftar Siswa (/pemain)
**Field Form Tambah Siswa:**

| No | Field | Tipe | Required | Keterangan |
|----|-------|------|----------|------------|
| 1 | Foto Siswa | Upload | - | Gambar profil |
| 2 | Nama Lengkap | Text | ✅ | - |
| 3 | Tanggal Lahir | Date | ✅ | Auto-hitung kategori umur |
| 4 | Nama Panggilan | Text | - | - |
| 5 | Tempat Lahir | Text | - | - |
| 6 | Kategori Umur | Auto | ✅ | Otomatis dari tgl lahir |
| 7 | Jenis Kelamin | Dropdown | - | - |
| 8 | Agama | Dropdown | - | - |
| 9 | NIK | Text | - | No. Induk Kependudukan |
| 10 | NISN | Text | - | No. Induk Siswa Nasional |
| 11 | HP Siswa | Text | - | - |
| 12 | Posisi | Dropdown | - | GK/DF/MF/FW |
| 13 | Tinggi Badan | Number (cm) | - | - |
| 14 | Berat Badan | Number (kg) | - | - |
| 15 | Status | Dropdown | - | Default: Pending |
| 16 | Nama Orang Tua | Text | ✅ | - |
| 17 | HP Orang Tua | Text | ✅ | - |
| 18 | HP Ayah | Text | - | Terpisah |
| 19 | HP Ibu | Text | - | Terpisah |
| 20 | Email Orang Tua | Email | - | - |
| 21 | Klub Sebelumnya | Text | - | Riwayat klub |
| 22 | Provinsi | Dropdown | ✅ | Cascading address |
| 23 | Kabupaten/Kota | Dropdown | ✅ | Auto dari provinsi |
| 24 | Kecamatan | Dropdown | - | Auto dari kabupaten |
| 25 | Desa/Kelurahan | Dropdown | - | Auto dari kecamatan |
| 26 | Alamat Lengkap | Text | - | Jl/Dukuh/RT/RW |
| 27 | Catatan | Text | - | - |

**Upload Dokumen:**
- Akta Kelahiran
- Kartu Keluarga (KK)
- Dokumen NISN
- Kartu Pelajar / KIS
- Raport / Ijazah

**Fitur List:**
- Search siswa
- Filter: Semua KU (Kelompok Umur), Semua Status
- Template Excel (download template)
- Upload Excel (import massal)
- Bagikan Link (link pendaftaran online)

---

### 3.2 Pelatih (/pelatih)
**Field Form Tambah Pelatih:**

| No | Field | Tipe | Required | Keterangan |
|----|-------|------|----------|------------|
| 1 | Foto Pelatih | Upload | - | - |
| 2 | Nama Lengkap | Text | ✅ | - |
| 3 | No. HP | Text | - | - |
| 4 | Email | Text | - | - |
| 5 | Lisensi | Checkbox (multi) | - | Bisa pilih lebih dari satu |
| 6 | Lisensi Lainnya | Text | - | Manual input |
| 7 | Jabatan | Checkbox (multi) | - | Bisa pilih 2-4 |
| 8 | Tempat Lahir | Text | - | - |
| 9 | Tanggal Lahir | Date | - | - |
| 10 | Status | Dropdown | - | Default: Aktif |
| 11 | Provinsi | Dropdown | ✅ | Cascading address |
| 12 | Kabupaten/Kota | Dropdown | ✅ | - |
| 13 | Kecamatan | Dropdown | - | - |
| 14 | Desa/Kelurahan | Dropdown | - | - |
| 15 | Catatan | Text | - | - |

**Opsi Lisensi (Checkbox):**
- Belum Berlisensi
- D Nasional
- C Diploma (C AFC)
- B Diploma (B AFC)
- A Diploma (A AFC)
- Pro AFC
- Lisensi Fisik
- Lisensi Kiper
- Lisensi Futsal

**Opsi Jabatan (Checkbox):**
- Pelatih KU 8 Kebawah
- Pelatih KU 9 s/d KU 18 Keatas
- Pelatih Kiper
- Pelatih Fisik
- Asisten Pelatih
- Kepala Pelatih
- Koordinator Teknik

---

### 3.3 Absensi (/absensi)
**Fitur:**
- Search nama
- Download laporan
- Absen Batch (absensi massal)
- Tambah absensi manual

---

### 3.4 Jadwal (/jadwal)
**Fitur:**
- Search jadwal
- Tambah jadwal

---

### 3.5 Tes Fisik (/tes-fisik)
**Tab:**
- Input — form input hasil tes
- Hasil — data hasil tes
- Ranking — perankingan pemain
- Grafik — visualisasi data
- Print — cetak laporan
- Pedoman — panduan tes fisik

**Field Input:**
- Toggle switch (mode)
- Dropdown (jenis tes)
- Tanggal (default: hari ini)
- Dropdown (kelompok umur)
- Dropdown (siswa)
- Spinbutton (nilai)
- Textbox (catatan opsional)

---

### 3.6 Keuangan (/keuangan)
**Sub-menu:**

| Sub-menu | URL | Keterangan |
|----------|-----|------------|
| Buku Kas | /buku-kas | Catatan kas umum |
| Kas Masuk | /kas-masuk | Pemasukan |
| Kas Keluar | /kas-keluar | Pengeluaran |
| SPP Siswa | /spp | Tagihan & pembayaran SPP |
| Dispensasi SPP | /dispensasi | Keringanan SPP |
| Tabungan | /tabungan | Tabungan siswa |
| Transaksi | /transaksi | Semua transaksi |

**SPP Siswa:**
- Search siswa
- Filter dropdown
- Bayar SPP
- Export

---

### 3.7 Komunikasi (/komunikasi)
**Fitur:**
- Buat Pengumuman
- Search pengumuman
- Filter (2 dropdown)

---

### 3.8 Seleksi (/seleksi)
**Fitur:**
- Buat Seleksi

---

### 3.9 Master Data (/master-data)
**Data yang bisa di-manage:**
- Posisi (GK/DF/MF/FW + custom)
- Jenis Pelanggaran
- Reset Default

---

### 3.10 Premium Features (perlu upgrade)
- Raport
- Laporan Semester
- Surat Menyurat
- Turnamen

---

## 4. Dashboard Stats

Dashboard menampilkan:
- **Jumlah Siswa** (total & aktif)
- **Pelatih Aktif** (total)
- **Absensi** (hari ini)
- **Alumni** (total)
- **SPP Lunas** (count)
- **Menunggak** (count)
- **Bulan Tertunggak** (count)
- **Pendapatan** (Rp)
- **Grafik Keuangan** (per bulan Jan-Des)
- **Siswa Per Kelas** (chart)
- **Jadwal Hari Ini**
- **Transaksi Terbaru**

---

## 5. Model Harga

| Paket | Harga | Fitur Premium |
|-------|-------|---------------|
| Gratis | Rp 0 | ≤20 siswa, fitur dasar |
| Starter | Rp 99rb/bln | + Rapor + Laporan Semester |
| Growth | Rp 199rb/3 bln | + Turnamen + Invoice |
| Pro Academy | Rp 349rb/6 bln | + Profil Publik + Dedicated Support |

---

## 6. Kesimpulan & Peluang Pengembangan

### Fitur yang dimiliki Kita Juara:
1. ✅ Manajemen Siswa (lengkap dengan dokumen)
2. ✅ Manajemen Pelatih (lisensi & jabatan)
3. ✅ Absensi (batch + manual)
4. ✅ Jadwal Latihan
5. ✅ Tes Fisik (input, ranking, grafik)
6. ✅ Keuangan (kas, SPP, tabungan, dispensasi)
7. ✅ Komunikasi/Pengumuman
8. ✅ Seleksi Pemain
9. ✅ Master Data (posisi, pelanggaran)
10. ✅ Export Data
11. ✅ Pendaftaran Online (link share)
12. ✅ Import Excel

### Fitur Premium (berbayar):
1. 🔒 Raport
2. 🔒 Laporan Semester
3. 🔒 Surat Menyurat
4. 🔒 Turnamen

### Peluang Kita untuk Bersaing:
1. **Tes Fisik lebih detail** — Kita Juara punya ranking & grafik, kita bisa tambah standar PSSI/Filanesia
2. **Rapor gratis** — Kita Juara lock di premium, kita bisa buka untuk semua
3. **Turnamen gratis** — Sama, lock di premium
4. **Kurikulum Filanesia** — Integrasi materi latihan sesuai standar PSSI
5. **Evaluasi taktikal** — Kita Juara fokus fisik+teknis, kita bisa tambah aspek taktik & mental
6. **Multi-olahraga** — Expand ke futsal, basket, voli
7. **Mobile-first** — PWA yang lebih baik
8. **Harga lebih kompetitif** — Atau fitur lebih banyak di tier gratis
9. **Surat Menyurat** — Kita Juara lock di premium, kita bisa sediakan gratis
10. **Analitik lebih dalam** — Dashboard dengan insight, bukan hanya angka

---

*Analisis berdasarkan observasi langsung ke dashboard Kita Juara, 25 Juni 2026.*
