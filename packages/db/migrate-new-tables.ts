// packages/db/migrate-new-tables.ts
// Script untuk menambahkan tabel-tabel baru & kolom type ke database yang sudah ada
// Jalankan: bun run migrate-new-tables.ts

import postgres from 'postgres';
import path from 'path';
import { readFileSync } from 'fs';

// Load .env dari apps/api
try {
  const envPath = path.resolve(process.cwd(), '../../apps/api/.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env tidak ditemukan, lanjut */ }

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const sql = postgres(connectionString);

async function migrate() {
  console.log('🚀 Menjalankan migrasi tabel baru...\n');

  try {
    // 1. Tambah kolom type ke tabel akademi (jika belum ada)
    console.log('1️⃣  Menambah kolom type ke tabel akademi...');
    await sql`
      ALTER TABLE akademi
      ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'akademi' NOT NULL
    `;
    console.log('   ✅ Kolom type berhasil ditambahkan\n');

    // 2. Buat tabel subscriptions
    console.log('2️⃣  Membuat tabel subscriptions...');
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id          TEXT PRIMARY KEY,
        akademi_id  TEXT NOT NULL REFERENCES akademi(id) ON DELETE CASCADE,
        plan        VARCHAR(20) DEFAULT 'trial' NOT NULL,
        status      VARCHAR(20) DEFAULT 'active' NOT NULL,
        started_at  TIMESTAMP DEFAULT NOW() NOT NULL,
        expires_at  TIMESTAMP,
        created_at  TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at  TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('   ✅ Tabel subscriptions berhasil dibuat\n');

    // 3. Buat tabel user_onboarding_survey
    console.log('3️⃣  Membuat tabel user_onboarding_survey...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_onboarding_survey (
        id            SERIAL PRIMARY KEY,
        user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_type  VARCHAR(30) NOT NULL,
        raw_answers   JSONB,
        is_completed  BOOLEAN DEFAULT FALSE NOT NULL,
        completed_at  TIMESTAMP,
        CONSTRAINT user_onboarding_survey_user_id_unique UNIQUE (user_id)
      )
    `;
    console.log('   ✅ Tabel user_onboarding_survey berhasil dibuat\n');

    // 4. Buat tabel onboarding_progress
    console.log('4️⃣  Membuat tabel onboarding_progress...');
    await sql`
      CREATE TABLE IF NOT EXISTS onboarding_progress (
        id           SERIAL PRIMARY KEY,
        user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        step         VARCHAR(50) NOT NULL,
        completed    BOOLEAN DEFAULT FALSE NOT NULL,
        completed_at TIMESTAMP,
        CONSTRAINT onboarding_progress_user_step_unique UNIQUE (user_id, step)
      )
    `;
    console.log('   ✅ Tabel onboarding_progress berhasil dibuat\n');

    // 5. Tambah index untuk performa
    console.log('5️⃣  Membuat index...');
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_akademi ON subscriptions(akademi_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_progress(user_id)`;
    console.log('   ✅ Index berhasil dibuat\n');

    console.log('🎉 Semua migrasi berhasil dijalankan!');
    console.log('\nTabel baru yang tersedia:');
    console.log('  - public.subscriptions');
    console.log('  - public.user_onboarding_survey');
    console.log('  - public.onboarding_progress');
    console.log('  - Kolom type di public.akademi');

  } catch (err) {
    console.error('❌ Error saat migrasi:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
