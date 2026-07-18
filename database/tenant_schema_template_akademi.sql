-- template: tenant_schema_template.sql
-- Dijalankan dengan: SET search_path TO 'tenant_{slug}';

-- Master Data
CREATE TABLE kelompok_umur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(30) NOT NULL,
    usia_min INT,
    usia_max INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_posisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(10) NOT NULL,
    nama VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_pelanggaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    poin INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Siswa & Orang Tua
CREATE TABLE siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('aktif', 'alumni', 'nonaktif', 'pending')),
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

CREATE TABLE orang_tua (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID UNIQUE NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    nama_orang_tua VARCHAR(100) NOT NULL,
    hp_orang_tua VARCHAR(20) NOT NULL,
    hp_ayah VARCHAR(20),
    hp_ibu VARCHAR(20),
    email VARCHAR(100),
    hubungan VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dokumen_siswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    jenis VARCHAR(20) NOT NULL
      CHECK (jenis IN ('akta', 'kk', 'nisn', 'kartu_pelajar', 'raport')),
    file_url TEXT NOT NULL,
    nama_file VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pelatih
CREATE TABLE pelatih (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,  -- link ke public.users(id)
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

CREATE TABLE pelatih_lisensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    lisensi VARCHAR(20) NOT NULL CHECK (lisensi IN (
        'd_nasional', 'c_afc', 'b_afc', 'a_afc', 'pro_afc',
        'fisik', 'kiper', 'futsal', 'lainnya'
    )),
    lisensi_lainnya VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pelatih_jabatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    jabatan VARCHAR(30) NOT NULL CHECK (jabatan IN (
        'pelatih_ku', 'pelatih_kiper', 'pelatih_fisik',
        'asisten', 'kepala_pelatih', 'koordinator'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadwal & Absensi
CREATE TABLE jadwal_latihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    hari VARCHAR(10) CHECK (hari IN (
        'senin','selasa','rabu','kamis','jumat','sabtu','minggu'
    )),
    waktu_mulai TIME,
    waktu_selesai TIME,
    lokasi VARCHAR(200),
    materi TEXT,
    tanggal DATE,
    status VARCHAR(20) DEFAULT 'aktif'
      CHECK (status IN ('aktif', 'batal', 'selesai')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jadwal_id UUID NOT NULL REFERENCES jadwal_latihan(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status VARCHAR(10) NOT NULL
      CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (jadwal_id, siswa_id, tanggal)
);

-- Keuangan
CREATE TABLE spp_tagihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun INT NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'belum'
      CHECK (status IN ('lunas', 'belum', 'dispensasi')),
    jatuh_tempo DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (siswa_id, bulan, tahun)
);

CREATE TABLE spp_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id UUID NOT NULL REFERENCES spp_tagihan(id) ON DELETE CASCADE,
    tanggal_bayar DATE NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    metode VARCHAR(20) CHECK (metode IN ('tunai', 'transfer', 'qris', 'lainnya')),
    bukti_url TEXT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buku_kas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
    kategori VARCHAR(50),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tabungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('simpan', 'tarik')),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluasi & Penilaian
CREATE TABLE tes_fisik (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    jenis_tes VARCHAR(50) NOT NULL,
    nilai DECIMAL(8,2) NOT NULL,
    satuan VARCHAR(20),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE seleksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    tanggal DATE,
    lokasi VARCHAR(200),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seleksi_peserta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seleksi_id UUID NOT NULL REFERENCES seleksi(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'daftar'
      CHECK (status IN ('daftar', 'lulus', 'tidak_lulus')),
    nilai DECIMAL(5,2),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (seleksi_id, siswa_id)
);

CREATE TABLE pelanggaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    master_pelanggaran_id UUID REFERENCES master_pelanggaran(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Komunikasi
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    target VARCHAR(20) DEFAULT 'semua'
      CHECK (target IN ('semua', 'siswa', 'orang_tua', 'pelatih')),
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifikasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    penerima_user_id TEXT,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    tipe VARCHAR(20) DEFAULT 'info'
      CHECK (tipe IN ('info', 'pengumuman', 'spp', 'jadwal', 'absensi', 'turnamen')),
    target VARCHAR(20) DEFAULT 'semua'
      CHECK (target IN ('semua', 'siswa', 'orang_tua', 'pelatih', 'per_siswa')),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via VARCHAR(20) DEFAULT 'in_app'
      CHECK (sent_via IN ('in_app', 'push', 'wa', 'email')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Turnamen & Pertandingan
CREATE TABLE turnamen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    lokasi VARCHAR(200),
    kategori_umur VARCHAR(30),
    hasil TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE turnamen_peserta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE match (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turnamen_id UUID NOT NULL REFERENCES turnamen(id) ON DELETE CASCADE,
    babak VARCHAR(30) DEFAULT 'penyisihan'
      CHECK (babak IN ('penyisihan', 'perempat_final', 'semi_final',
                        'final', 'grup', 'friendly')),
    match_no INT,
    tanggal DATE,
    waktu TIME,
    lokasi VARCHAR(200),
    tim_home VARCHAR(100),
    tim_away VARCHAR(100),
    skor_home INT DEFAULT 0,
    skor_away INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'belum'
      CHECK (status IN ('belum', 'berlangsung', 'selesai', 'batal')),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_lineup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
    tim VARCHAR(10) CHECK (tim IN ('home', 'away')),
    posisi VARCHAR(20),
    status VARCHAR(20) DEFAULT 'starter'
      CHECK (status IN ('starter', 'cadangan', 'masuk', 'keluar')),
    menit_masuk INT,
    menit_keluar INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (match_id, siswa_id, tim)
);

CREATE TABLE match_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE SET NULL,
    tipe VARCHAR(20) NOT NULL
      CHECK (tipe IN ('gol', 'assist', 'kartu_kuning', 'kartu_merah',
                       'substitusi', 'own_goal')),
    menit INT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kurikulum & Materi
CREATE TABLE materi_kategori (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materi_latihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kategori_id UUID REFERENCES materi_kategori(id) ON DELETE SET NULL,
    kelompok_umur_id UUID REFERENCES kelompok_umur(id) ON DELETE SET NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    durasi_menit INT,
    level VARCHAR(20) DEFAULT 'pemula'
      CHECK (level IN ('pemula', 'menengah', 'lanjutan')),
    tipe VARCHAR(20) DEFAULT 'teknik'
      CHECK (tipe IN ('teknik', 'fisik', 'taktik', 'mental', 'permainan')),
    instruksi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE log_pelatih (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pelatih_id UUID NOT NULL REFERENCES pelatih(id) ON DELETE CASCADE,
    jadwal_id UUID REFERENCES jadwal_latihan(id) ON DELETE SET NULL,
    tanggal DATE NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    materi_id UUID REFERENCES materi_latihan(id) ON DELETE SET NULL,
    catatan TEXT,
    durasi_menit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventaris
CREATE TABLE inventaris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    kategori VARCHAR(50)
      CHECK (kategori IN ('jersey','bola','cone','rompi','gawang','medis','lainnya')),
    jumlah INT NOT NULL DEFAULT 0,
    satuan VARCHAR(20) DEFAULT 'pcs',
    kondisi VARCHAR(20) DEFAULT 'baik'
      CHECK (kondisi IN ('baik','rusak_ringan','rusak_berat')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaris_distribusi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventaris_id UUID NOT NULL REFERENCES inventaris(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE SET NULL,
    jumlah INT NOT NULL DEFAULT 1,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'dipinjam'
      CHECK (status IN ('dipinjam','dikembalikan','hilang','milik')),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaris_mutasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventaris_id UUID NOT NULL REFERENCES inventaris(id) ON DELETE CASCADE,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('masuk','keluar')),
    jumlah INT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES (per-tenant schema)
-- ==========================================
CREATE INDEX idx_siswa_ku ON siswa(kelompok_umur_id);
CREATE INDEX idx_siswa_status ON siswa(status);
CREATE INDEX idx_siswa_nama ON siswa(nama_lengkap);
CREATE INDEX idx_orang_tua_siswa ON orang_tua(siswa_id);
CREATE INDEX idx_pelatih_status ON pelatih(status);
CREATE INDEX idx_jadwal_ku ON jadwal_latihan(kelompok_umur_id);
CREATE INDEX idx_jadwal_tanggal ON jadwal_latihan(tanggal);
CREATE INDEX idx_absensi_jadwal ON absensi(jadwal_id);
CREATE INDEX idx_absensi_siswa ON absensi(siswa_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_spp_tagihan_siswa ON spp_tagihan(siswa_id);
CREATE INDEX idx_spp_tagihan_status ON spp_tagihan(status);
CREATE INDEX idx_spp_pembayaran_tagihan ON spp_pembayaran(tagihan_id);
CREATE INDEX idx_buku_kas_tanggal ON buku_kas(tanggal);
CREATE INDEX idx_tabungan_siswa ON tabungan(siswa_id);
CREATE INDEX idx_tes_fisik_siswa ON tes_fisik(siswa_id);
CREATE INDEX idx_evaluasi_siswa ON evaluasi(siswa_id);
CREATE INDEX idx_turnamen_peserta_turnamen ON turnamen_peserta(turnamen_id);
CREATE INDEX idx_match_turnamen ON match(turnamen_id);
CREATE INDEX idx_match_lineup_match ON match_lineup(match_id);
CREATE INDEX idx_match_event_match ON match_event(match_id);
CREATE INDEX idx_notifikasi_read ON notifikasi(is_read);
