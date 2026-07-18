-- =====================================================================
-- TEMPLATE SKEMA TENANT: MODEL D (WISATA OLAHRAGA / EVENT / KOMUNITAS)
-- =====================================================================

-- Tabel Event
CREATE TABLE event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(50) NOT NULL, -- 'outbound', 'running', 'cycling', 'hiking', 'diving', 'surfing', 'turnamen'
    tanggal DATE NOT NULL,
    lokasi VARCHAR(200) NOT NULL,
    harga_tiket DECIMAL(12, 2) NOT NULL DEFAULT 0,
    kapasitas_maksimal INT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'registrasi_buka', 'registrasi_tutup', 'berjalan', 'selesai', 'batal')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Peserta Event
CREATE TABLE peserta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    nomor_bib VARCHAR(10), -- Untuk event running/cycling
    kategori_peserta VARCHAR(50), -- Misal: '5K', '10K', 'Umum', 'Master'
    status_pembayaran VARCHAR(20) DEFAULT 'belum' CHECK (status_pembayaran IN ('belum', 'lunas', 'menunggu_verifikasi')),
    tanggal_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Aktivitas / Rundown Event
CREATE TABLE rundown_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME,
    nama_kegiatan VARCHAR(100) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Rute / Jalur (Untuk running, cycling, hiking)
CREATE TABLE rute_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    jarak_km DECIMAL(6, 2),
    elevasi_m INT,
    titik_start VARCHAR(100),
    titik_finish VARCHAR(100),
    peta_gpx_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Galeri Dokumentasi Event
CREATE TABLE dokumentasi_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    nama_file VARCHAR(255),
    keterangan TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_peserta_event ON peserta(event_id);
CREATE INDEX idx_rundown_event ON rundown_event(event_id);
CREATE INDEX idx_rute_event ON rute_event(event_id);
CREATE INDEX idx_dokumentasi_event ON dokumentasi_event(event_id);
