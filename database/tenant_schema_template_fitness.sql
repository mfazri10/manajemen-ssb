-- ============================================================
-- tenant_schema_template_fitness.sql
-- Template schema untuk Gym / Studio Kebugaran / Fitness Center
-- Dijalankan saat provisioning tenant baru dengan type: gym / yoga / pilates / dll
-- SET search_path TO tenant_{slug} sebelum menjalankan file ini
-- ============================================================

CREATE TABLE konfigurasi_fitness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_studio VARCHAR(100) NOT NULL,
    jam_buka TIME DEFAULT '06:00',
    jam_tutup TIME DEFAULT '22:00',
    kapasitas_max INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paket_membership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    durasi_hari INT NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    fitur TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instruktur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    spesialisasi VARCHAR(100),
    foto_url TEXT,
    no_hp VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_member VARCHAR(20) UNIQUE,
    nama_lengkap VARCHAR(100) NOT NULL,
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
    no_hp VARCHAR(20),
    email VARCHAR(100),
    alamat TEXT,
    foto_url TEXT,
    catatan_kesehatan TEXT,
    status VARCHAR(20) DEFAULT 'aktif'
        CHECK (status IN ('aktif', 'nonaktif', 'freeze')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE membership_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
    paket_id UUID NOT NULL REFERENCES paket_membership(id) ON DELETE RESTRICT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    harga_bayar DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif'
        CHECK (status IN ('aktif', 'expired', 'freeze', 'batal')),
    metode_bayar VARCHAR(20)
        CHECK (metode_bayar IN ('tunai', 'transfer', 'qris', 'lainnya')),
    bukti_bayar_url TEXT,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    tipe VARCHAR(50),
    instruktur_id UUID REFERENCES instruktur(id) ON DELETE SET NULL,
    kapasitas INT DEFAULT 20,
    durasi_menit INT DEFAULT 60,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jadwal_kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelas_id UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    hari VARCHAR(10) NOT NULL
        CHECK (hari IN ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu')),
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jadwal_id UUID NOT NULL REFERENCES jadwal_kelas(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'hadir'
        CHECK (status IN ('hadir', 'absen', 'batal')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (jadwal_id, member_id, tanggal)
);

CREATE TABLE kunjungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES member(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_masuk TIME DEFAULT CURRENT_TIME,
    jam_keluar TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pengeluaran_fitness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori VARCHAR(50),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    bukti_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membership_member     ON membership_member(member_id);
CREATE INDEX idx_membership_status     ON membership_member(status);
CREATE INDEX idx_membership_tgl_selesai ON membership_member(tanggal_selesai);
CREATE INDEX idx_booking_kelas_jadwal  ON booking_kelas(jadwal_id, tanggal);
CREATE INDEX idx_kunjungan_member      ON kunjungan(member_id);
CREATE INDEX idx_kunjungan_tanggal     ON kunjungan(tanggal);
CREATE INDEX idx_jadwal_kelas_hari     ON jadwal_kelas(hari);

INSERT INTO konfigurasi_fitness (nama_studio, jam_buka, jam_tutup, kapasitas_max)
VALUES ('Studio Saya', '06:00', '22:00', 50);

INSERT INTO paket_membership (nama, durasi_hari, harga, is_active) VALUES
    ('Paket 1 Bulan',  30,  300000, TRUE),
    ('Paket 3 Bulan',  90,  800000, TRUE),
    ('Paket 1 Tahun', 365, 2500000, TRUE);
