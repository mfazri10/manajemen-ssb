-- ============================================================
-- AFFILIATE PROGRAM — Migration
-- Jalankan script ini ke database PostgreSQL Anda
-- Tabel-tabel ini berada di schema public (platform-level)
-- ============================================================

-- Profil affiliate
CREATE TABLE IF NOT EXISTS public.affiliates (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    kode_referral   VARCHAR(20) NOT NULL UNIQUE,
    tier            VARCHAR(20) NOT NULL DEFAULT 'starter'
                    CHECK (tier IN ('starter', 'growth', 'pro', 'elite')),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    komisi_flat_idr NUMERIC(12, 2),
    komisi_pct_y1   NUMERIC(5, 2),
    komisi_pct_y2   NUMERIC(5, 2),
    nama_bank       VARCHAR(50),
    nomor_rekening  VARCHAR(30),
    atas_nama       VARCHAR(100),
    total_klik      INT NOT NULL DEFAULT 0,
    total_referral  INT NOT NULL DEFAULT 0,
    total_komisi    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    saldo_tersedia  NUMERIC(14, 2) NOT NULL DEFAULT 0,
    saldo_pending   NUMERIC(14, 2) NOT NULL DEFAULT 0,
    catatan_admin   TEXT,
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Link tracking unik per affiliate per campaign
CREATE TABLE IF NOT EXISTS public.affiliate_links (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    affiliate_id    TEXT NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    nama            VARCHAR(100) NOT NULL DEFAULT 'Link Utama',
    slug            VARCHAR(50) NOT NULL UNIQUE,
    target_url      TEXT NOT NULL DEFAULT '/register',
    utm_source      VARCHAR(50) DEFAULT 'affiliate',
    utm_medium      VARCHAR(50) DEFAULT 'referral',
    utm_campaign    VARCHAR(100),
    aktif           BOOLEAN NOT NULL DEFAULT TRUE,
    total_klik      INT NOT NULL DEFAULT 0,
    total_konversi  INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Log setiap kunjungan melalui link affiliate
CREATE TABLE IF NOT EXISTS public.affiliate_visits (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    affiliate_id    TEXT NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    link_id         TEXT REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
    ip_address      INET,
    user_agent      TEXT,
    referrer_url    TEXT,
    converted       BOOLEAN NOT NULL DEFAULT FALSE,
    converted_at    TIMESTAMP,
    visited_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Konversi sukses (tenant baru berlangganan via referral)
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    affiliate_id        TEXT NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
    link_id             TEXT REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
    visit_id            TEXT REFERENCES public.affiliate_visits(id) ON DELETE SET NULL,
    akademi_id          TEXT NOT NULL REFERENCES public.akademi(id) ON DELETE RESTRICT,
    payment_amount      NUMERIC(12, 2) NOT NULL,
    payment_bulan_ke    INT NOT NULL DEFAULT 1,
    komisi_flat         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    komisi_pct_earned   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    komisi_total        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'paid', 'rejected', 'reversed')),
    catatan             TEXT,
    conversion_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_at         TIMESTAMP,
    paid_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permintaan & histori pencairan komisi
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    affiliate_id    TEXT NOT NULL REFERENCES public.affiliates(id) ON DELETE RESTRICT,
    jumlah          NUMERIC(12, 2) NOT NULL,
    metode          VARCHAR(30) NOT NULL DEFAULT 'transfer_bank'
                    CHECK (metode IN ('transfer_bank', 'ewallet_gopay', 'ewallet_ovo', 'ewallet_dana', 'xendit')),
    status          VARCHAR(20) NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested', 'processing', 'paid', 'failed', 'cancelled')),
    bukti_transfer  TEXT,
    referensi_biaya VARCHAR(100),
    catatan         TEXT,
    requested_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMP,
    paid_at         TIMESTAMP
);

-- Detail item per pencairan
CREATE TABLE IF NOT EXISTS public.affiliate_payout_items (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    payout_id   TEXT NOT NULL REFERENCES public.affiliate_payouts(id) ON DELETE CASCADE,
    referral_id TEXT NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE RESTRICT,
    jumlah      NUMERIC(12, 2) NOT NULL
);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id     ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_kode        ON public.affiliates(kode_referral);
CREATE INDEX IF NOT EXISTS idx_affiliates_tier        ON public.affiliates(tier);
CREATE INDEX IF NOT EXISTS idx_affiliates_status      ON public.affiliates(status);

CREATE INDEX IF NOT EXISTS idx_aff_links_affiliate    ON public.affiliate_links(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_links_slug         ON public.affiliate_links(slug);

CREATE INDEX IF NOT EXISTS idx_aff_visits_affiliate   ON public.affiliate_visits(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_visits_converted   ON public.affiliate_visits(converted);

CREATE INDEX IF NOT EXISTS idx_aff_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_referrals_akademi   ON public.affiliate_referrals(akademi_id);
CREATE INDEX IF NOT EXISTS idx_aff_referrals_status    ON public.affiliate_referrals(status);

CREATE INDEX IF NOT EXISTS idx_aff_payouts_affiliate  ON public.affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_payouts_status     ON public.affiliate_payouts(status);
