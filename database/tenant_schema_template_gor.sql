-- ============================================================
-- tenant_schema_template_gor.sql
-- Template schema untuk GOR / Arena / Venue Booking
-- Dijalankan saat provisioning tenant baru dengan type: gor / venue_*
-- SET search_path TO tenant_{slug} sebelum menjalankan file ini
-- ============================================================

CREATE TABLE konfigurasi_gor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_gor VARCHAR(100) NOT NULL,
    jam_buka TIME DEFAULT '06:00',
    jam_tutup TIME DEFAULT '23:00',
    durasi_slot_menit INT DEFAULT 60,
    batas_booking_hari INT DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lapangan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    tipe VARCHAR(30),
    kapasitas INT DEFAULT 1,
    harga_per_jam DECIMAL(12,2) NOT NULL,
    harga_weekend DECIMAL(12,2),
    fasilitas TEXT,
    foto_url TEXT,
    status VARCHAR(20) DEFAULT 'aktif'
        CHECK (status IN ('aktif', 'nonaktif', 'maintenance')),
    urutan INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slot_waktu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lapangan_id UUID NOT NULL REFERENCES lapangan(id) ON DELETE CASCADE,
    hari VARCHAR(10) NOT NULL
        CHECK (hari IN ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu')),
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    harga_override DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pelanggan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20),
    email VARCHAR(100),
    total_booking INT DEFAULT 0,
    total_pengeluaran DECIMAL(14,2) DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lapangan_id UUID NOT NULL REFERENCES lapangan(id) ON DELETE RESTRICT,
    pelanggan_id UUID REFERENCES pelanggan(id) ON DELETE SET NULL,
    nama_pemesan VARCHAR(100) NOT NULL,
    no_hp_pemesan VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    durasi_jam DECIMAL(4,1) NOT NULL,
    total_harga DECIMAL(12,2) NOT NULL,
    dp_dibayar DECIMAL(12,2) DEFAULT 0,
    sisa_tagihan DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'konfirmasi', 'batal', 'selesai', 'no_show')),
    metode_bayar VARCHAR(20)
        CHECK (metode_bayar IN ('tunai', 'transfer', 'qris', 'lainnya')),
    bukti_bayar_url TEXT,
    sumber VARCHAR(20) DEFAULT 'admin'
        CHECK (sumber IN ('admin', 'online', 'whatsapp')),
    catatan TEXT,
    dibuat_oleh TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (lapangan_id, tanggal, jam_mulai)
);

CREATE TABLE blokir_lapangan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lapangan_id UUID NOT NULL REFERENCES lapangan(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_mulai TIME,
    jam_selesai TIME,
    alasan VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pengeluaran_gor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori VARCHAR(50),
    jumlah DECIMAL(12,2) NOT NULL,
    keterangan TEXT,
    bukti_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_lapangan    ON booking(lapangan_id);
CREATE INDEX idx_booking_tanggal     ON booking(tanggal);
CREATE INDEX idx_booking_status      ON booking(status);
CREATE INDEX idx_booking_pelanggan   ON booking(pelanggan_id);
CREATE INDEX idx_slot_lapangan       ON slot_waktu(lapangan_id);
CREATE INDEX idx_blokir_lapangan_tgl ON blokir_lapangan(lapangan_id, tanggal);
CREATE INDEX idx_pengeluaran_tanggal ON pengeluaran_gor(tanggal);

INSERT INTO konfigurasi_gor (nama_gor, jam_buka, jam_tutup, durasi_slot_menit, batas_booking_hari)
VALUES ('GOR Saya', '06:00', '23:00', 60, 7);

INSERT INTO lapangan (nama, tipe, harga_per_jam, status, urutan)
VALUES ('Lapangan 1', 'futsal', 100000, 'aktif', 1),
       ('Lapangan 2', 'futsal', 100000, 'aktif', 2);
