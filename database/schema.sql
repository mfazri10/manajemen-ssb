-- ============================================
-- Manajemen SSB — Database Schema
-- Database: PostgreSQL
-- Created: 2026-06-25
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MASTER DATA
-- ============================================

-- Akademi (Multi-tenant root)
CREATE TABLE akademi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_akademi VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    alamat TEXT,
    no_hp VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    paket VARCHAR(20) DEFAULT 'gratis' CHECK (paket IN ('gratis', 'starter', 'growth', 'pro')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kelompok Umur
CREATE TABLE kelompok_umur (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama VARCHAR(30) NOT NULL,
    usia_min INT,
    usia_max INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Posisi
CREATE TABLE master_posisi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    kode VARCHAR(10) NOT NULL,
    nama VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Pelanggaran
CREATE TABLE master_pelanggaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    poin INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER & AUTH
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'pelatih', 'orang_tua')),
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SISWA & ORANG TUA
-- ============================================

-- Siswa
CREATE TABLE siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    nisn VARCHAR(20),
    nik VARCHAR(20),
    nama_lengkap VARCHAR(100) NOT NULL,
    nama_panggilan VARCHAR(50),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
    agama VARCHAR(20),
    posisi_id UUID REFERENCES master_posisi(id) ON DELETE SET NULL,
    tinggi_badan DECIMAL(5,1),
    berat_badan DECIMAL(5,1),
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('aktif', 'alumni', 'nonaktif', 'pending')),
    klub_sebelumnya VARCHAR(100),
    provinsi VARCHAR(50),
    kabupaten VARCHAR(50),
    kecamatan VARCHAR(50),
    desa VARCHAR(50),
    alamat_lengkap TEXT,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orang Tua (1:1 dengan siswa)
CREATE TABLE orang_tua (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID UNIQUE NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    nama_orang_tua VARCHAR(100) NOT NULL,
    hp_orang_tua VARCHAR(20) NOT NULL,
    hp_ayah VARCHAR(20),
    hp_ibu VARCHAR(20),
    email VARCHAR(100),
    hubungan VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dokumen Siswa (1:N)
CREATE TABLE dokumen_siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('akta', 'kk', 'nisn', 'kartu_pelajar', 'raport')),
    file_url TEXT NOT NULL,
    nama_file VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PELATIH
-- ============================================

-- Pelatih
CREATE TABLE pelatih (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    email VARCHAR(100),
    tempat_lahir VARCHAR(50),
    tanggal_lahir DATE,
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    provinsi VARCHAR(50),
    kabupaten VARCHAR(50),
    kecamatan VARCHAR(50),
    desa VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pelatih Lisensi (1:N)
CREATE TABLE pelatih_lisensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    lisensi VARCHAR(20) NOT NULL CHECK (lisensi IN (
        'd_nasional', 'c_afc', 'b_afc', 'a_afc', 'pro_afc',
        'fisik', 'kiper', 'futsal', 'lainnya'
    )),
    lisensi_lainnya VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pelatih Jabatan (1:N)
CREATE TABLE pelatih_jabatan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    jabatan VARCHAR(30) NOT NULL CHECK (jabatan IN (
        'pelatih_ku', 'pelatih_kiper', 'pelatih_fisik',
        'asisten', 'kepala_pelatih', 'koordinator'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- JADWAL & ABSENSI
-- ============================================

-- Jadwal Latihan
CREATE TABLE jadwal_latihan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    hari VARCHAR(10) CHECK (hari IN ('senin','selasa','rabu','kamis','jumat','sabtu','minggu')),
    waktu_mulai TIME,
    waktu_selesai TIME,
    lokasi VARCHAR(200),
    materi TEXT,
    tanggal DATE,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'batal', 'selesai')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Absensi
CREATE TABLE absensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jadwal_id UUID NOT NULL REFERENCES jadwal_latihan(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (jadwal_id, siswa_id, tanggal)
);

-- ============================================
-- KEUANGAN
-- ============================================

-- SPP Tagihan
CREATE TABLE spp_tagihan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'belum' CHECK (status IN ('lunas', 'belum', 'dispensasi')),
    jatuh_tempo DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (siswa_id, bulan, tahun)
);

-- SPP Pembayaran (1 tagihan bisa dicicil)
CREATE TABLE spp_pembayaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tagihan_id UUID NOT NULL REFERENCES spp_tagihan(id) ON DELETE CASCADE,
    tanggal_bayar DATE NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    metode VARCHAR(20) CHECK (metode IN ('tunai', 'transfer', 'qris', 'lainnya')),
    bukti_url TEXT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buku Kas (pemasukan & pengeluaran umum)
CREATE TABLE buku_kas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
    kategori VARCHAR(50),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabungan Siswa
CREATE TABLE tabungan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('simpan', 'tarik')),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EVALUASI & PENILAIAN
-- ============================================

-- Tes Fisik
CREATE TABLE tes_fisik (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    jenis_tes VARCHAR(50) NOT NULL,
    nilai DECIMAL(8,2) NOT NULL,
    satuan VARCHAR(20),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluasi / Raport
CREATE TABLE evaluasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    pelatih_id UUID REFERENCES pelatih(id) ON DELETE SET NULL,
    semester VARCHAR(10) NOT NULL,
    tahun_ajaran VARCHAR(10) NOT NULL,
    teknik INT CHECK (teknik BETWEEN 0 AND 100),
    fisik INT CHECK (fisik BETWEEN 0 AND 100),
    taktik INT CHECK (taktik BETWEEN 0 AND 100),
    mental INT CHECK (mental BETWEEN 0 AND 100),
    catatan_pelatih TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (siswa_id, semester, tahun_ajaran)
);

-- Seleksi
CREATE TABLE seleksi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    tanggal DATE,
    lokasi VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seleksi Peserta
CREATE TABLE seleksi_peserta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seleksi_id UUID NOT NULL REFERENCES seleksi(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'daftar' CHECK (status IN ('daftar', 'lulus', 'tidak_lulus')),
    nilai DECIMAL(5,2),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (seleksi_id, siswa_id)
);

-- Pelanggaran
CREATE TABLE pelanggaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    master_pelanggaran_id UUID REFERENCES master_pelanggaran(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- KOMUNIKASI & TURNAMEN
-- ============================================

-- Pengumuman
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    target VARCHAR(20) DEFAULT 'semua' CHECK (target IN ('semua', 'siswa', 'orang_tua', 'pelatih')),
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Turnamen
CREATE TABLE turnamen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama VARCHAR(200) NOT NULL,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    lokasi VARCHAR(200),
    kategori_umur VARCHAR(30),
    hasil TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Turnamen Peserta
CREATE TABLE turnamen_peserta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turnamen_id UUID NOT NULL REFERENCES turnamen(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    posisi VARCHAR(20),
    gol INT DEFAULT 0,
    kartu_kuning INT DEFAULT 0,
    kartu_merah INT DEFAULT 0,
    menit_bermain INT,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (turnamen_id, siswa_id)
);

-- ============================================
-- NOTIFIKASI & PESAN
-- ============================================

-- Notifikasi
CREATE TABLE notifikasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    penerima_id UUID REFERENCES users(id) ON DELETE SET NULL,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    tipe VARCHAR(20) DEFAULT 'info' CHECK (tipe IN ('info', 'pengumuman', 'spp', 'jadwal', 'absensi', 'turnamen')),
    target VARCHAR(20) DEFAULT 'semua' CHECK (target IN ('semua', 'siswa', 'orang_tua', 'pelatih', 'per_siswa')),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via VARCHAR(20) DEFAULT 'in_app' CHECK (sent_via IN ('in_app', 'push', 'wa', 'email')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MATERI LATIHAN / KURIKULUM
-- ============================================

-- Kategori Materi
CREATE TABLE materi_kategori (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    nama VARCHAR(100) NOT NULL,
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materi Latihan
CREATE TABLE materi_latihan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    akademi_id UUID NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
    kategori_id UUID REFERENCES materi_kategori(id) ON DELETE SET NULL,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    durasi_menit INT,
    level VARCHAR(20) DEFAULT 'pemula' CHECK (level IN ('pemula', 'menengah', 'lanjutan')),
    tipe VARCHAR(20) DEFAULT 'teknik' CHECK (tipe IN ('teknik', 'fisik', 'taktik', 'mental', 'permainan')),
    instruksi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LOG AKTIVITAS PELATIH
-- ============================================

CREATE TABLE log_pelatih (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    jadwal_id UUID REFERENCES jadwal_latihan(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    materi_id UUID REFERENCES materi_latihan(id) ON DELETE SET NULL,
    catatan TEXT,
    durasi_menit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MATCH / PERTANDINGAN (Detail per Pertandingan)
-- ============================================

-- Match (detail pertandingan dalam 1 turnamen)
CREATE TABLE match (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turnamen_id UUID NOT NULL REFERENCES turnamen(id) ON DELETE CASCADE,
    babak VARCHAR(30) DEFAULT 'penyisihan' CHECK (babak IN ('penyisihan', 'perempat_final', 'semi_final', 'final', 'grup', 'friendly')),
    match_no INT,
    tanggal DATE,
    waktu TIME,
    lokasi VARCHAR(200),
    tim_home VARCHAR(100),
    tim_away VARCHAR(100),
    skor_home INT DEFAULT 0,
    skor_away INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'belum' CHECK (status IN ('belum', 'berlangsung', 'selesai', 'batal')),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match Lineup (susunan pemain per match)
CREATE TABLE match_lineup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tim VARCHAR(10) CHECK (tim IN ('home', 'away')),
    posisi VARCHAR(20),
    status VARCHAR(20) DEFAULT 'starter' CHECK (status IN ('starter', 'cadangan', 'masuk', 'keluar')),
    menit_masuk INT,
    menit_keluar INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (match_id, siswa_id, tim)
);

-- Match Event (gol, kartu, assist, dll)
CREATE TABLE match_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE SET NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('gol', 'assist', 'kartu_kuning', 'kartu_merah', 'substitusi', 'own_goal')),
    menit INT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Klasemen (auto-calculate dari match)
CREATE VIEW v_klasemen AS
SELECT
    m.turnamen_id,
    COALESCE(ml.tim, ml2.tim) AS tim,
    COUNT(DISTINCT m.id) AS main,
    SUM(CASE
        WHEN (ml.tim = 'home' AND m.skor_home > m.skor_away) OR (ml.tim = 'away' AND m.skor_away > m.skor_home) THEN 1
        ELSE 0
    END) AS menang,
    SUM(CASE
        WHEN m.skor_home = m.skor_away THEN 1
        ELSE 0
    END) AS seri,
    SUM(CASE
        WHEN (ml.tim = 'home' AND m.skor_home < m.skor_away) OR (ml.tim = 'away' AND m.skor_away < m.skor_home) THEN 1
        ELSE 0
    END) AS kalah,
    SUM(CASE WHEN ml.tim = 'home' THEN m.skor_home ELSE m.skor_away END) AS gol_memasukkan,
    SUM(CASE WHEN ml.tim = 'home' THEN m.skor_away ELSE m.skor_home END) AS gol_kebobolan,
    SUM(CASE
        WHEN (ml.tim = 'home' AND m.skor_home > m.skor_away) OR (ml.tim = 'away' AND m.skor_away > m.skor_home) THEN 3
        WHEN m.skor_home = m.skor_away THEN 1
        ELSE 0
    END) AS poin
FROM match m
LEFT JOIN match_lineup ml ON ml.match_id = m.id AND ml.tim = 'home'
LEFT JOIN match_lineup ml2 ON ml2.match_id = m.id AND ml2.tim = 'away'
WHERE m.status = 'selesai'
GROUP BY m.turnamen_id, COALESCE(ml.tim, ml2.tim);

-- ============================================
-- INDEXES
-- ============================================

-- Siswa
CREATE INDEX idx_siswa_akademi ON siswa(akademi_id);
CREATE INDEX idx_siswa_ku ON siswa(kelompok_umur_id);
CREATE INDEX idx_siswa_status ON siswa(status);
CREATE INDEX idx_siswa_nama ON siswa(nama_lengkap);

-- Orang Tua
CREATE INDEX idx_orang_tua_siswa ON orang_tua(siswa_id);

-- Pelatih
CREATE INDEX idx_pelatih_akademi ON pelatih(akademi_id);
CREATE INDEX idx_pelatih_status ON pelatih(status);

-- Jadwal
CREATE INDEX idx_jadwal_akademi ON jadwal_latihan(akademi_id);
CREATE INDEX idx_jadwal_ku ON jadwal_latihan(kelompok_umur_id);
CREATE INDEX idx_jadwal_tanggal ON jadwal_latihan(tanggal);

-- Absensi
CREATE INDEX idx_absensi_jadwal ON absensi(jadwal_id);
CREATE INDEX idx_absensi_siswa ON absensi(siswa_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);

-- SPP
CREATE INDEX idx_spp_tagihan_siswa ON spp_tagihan(siswa_id);
CREATE INDEX idx_spp_tagihan_status ON spp_tagihan(status);
CREATE INDEX idx_spp_pembayaran_tagihan ON spp_pembayaran(tagihan_id);

-- Buku Kas
CREATE INDEX idx_buku_kas_akademi ON buku_kas(akademi_id);
CREATE INDEX idx_buku_kas_tanggal ON buku_kas(tanggal);

-- Tabungan
CREATE INDEX idx_tabungan_siswa ON tabungan(siswa_id);

-- Tes Fisik
CREATE INDEX idx_tes_fisik_siswa ON tes_fisik(siswa_id);
CREATE INDEX idx_tes_fisik_tanggal ON tes_fisik(tanggal);

-- Evaluasi
CREATE INDEX idx_evaluasi_siswa ON evaluasi(siswa_id);
CREATE INDEX idx_evaluasi_semester ON evaluasi(semester, tahun_ajaran);

-- Turnamen
CREATE INDEX idx_turnamen_akademi ON turnamen(akademi_id);
CREATE INDEX idx_turnamen_peserta_turnamen ON turnamen_peserta(turnamen_id);
CREATE INDEX idx_turnamen_peserta_siswa ON turnamen_peserta(siswa_id);

-- Pengumuman
CREATE INDEX idx_pengumuman_akademi ON pengumuman(akademi_id);

-- Notifikasi
CREATE INDEX idx_notifikasi_akademi ON notifikasi(akademi_id);
CREATE INDEX idx_notifikasi_penerima ON notifikasi(penerima_id);
CREATE INDEX idx_notifikasi_read ON notifikasi(is_read);

-- Materi Latihan
CREATE INDEX idx_materi_akademi ON materi_latihan(akademi_id);
CREATE INDEX idx_materi_kategori ON materi_latihan(kategori_id);
CREATE INDEX idx_materi_ku ON materi_latihan(kelompok_umur_id);

-- Log Pelatih
CREATE INDEX idx_log_pelatih_pelatih ON log_pelatih(pelatih_id);
CREATE INDEX idx_log_pelatih_tanggal ON log_pelatih(tanggal);

-- Match
CREATE INDEX idx_match_turnamen ON match(turnamen_id);
CREATE INDEX idx_match_tanggal ON match(tanggal);
CREATE INDEX idx_match_lineup_match ON match_lineup(match_id);
CREATE INDEX idx_match_lineup_siswa ON match_lineup(siswa_id);
CREATE INDEX idx_match_event_match ON match_event(match_id);
CREATE INDEX idx_match_event_siswa ON match_event(siswa_id);

-- ============================================
-- SEED DATA: Default Posisi
-- ============================================
-- Akan di-insert saat akademi baru dibuat via aplikasi
