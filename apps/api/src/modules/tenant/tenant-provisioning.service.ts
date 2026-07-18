import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { akademi } from '@workspace/db';
import { sql, eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(private dbService: DrizzleService) {}

  /**
   * Membuat tenant baru: schema + tabel + seed data default
   */
  async createTenant(akademiSlug: string): Promise<void> {
    const db = this.dbService.db;
    const schemaName = `tenant_${akademiSlug}`;
    this.logger.log(`Creating tenant schema: ${schemaName}`);

    // 1. Buat schema secara dinamis
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}`);

    // 2. Jalankan SQL template untuk membuat semua tabel
    const templatePath = path.join(process.cwd(), '../../database/tenant_schema_template.sql');
    const rawSql = fs.readFileSync(templatePath, 'utf-8');

    // Mengarahkan eksekusi template ke schema yang baru dibuat
    // Kita jalankan SET search_path di dalam transaction block untuk keamanan pool
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL search_path TO ${sql.identifier(schemaName)}, public`);
      
      const statements = rawSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        await tx.execute(sql.raw(stmt));
      }
      
      // 3. Seed data default dalam schema baru
      await this.seedDefaultDataInTx(tx);
    });

    this.logger.log(`Tenant ${schemaName} created successfully`);
  }

  /**
   * Seed data default ke transaksi yang sedang aktif
   */
  private async seedDefaultDataInTx(tx: any): Promise<void> {
    // Posisi default
    await tx.execute(sql`
      INSERT INTO master_posisi (kode, nama) VALUES
        ('GK', 'Penjaga Gawang'),
        ('CB', 'Bek Tengah'),
        ('RB', 'Bek Kanan'),
        ('LB', 'Bek Kiri'),
        ('CDM', 'Gelandang Bertahan'),
        ('CM', 'Gelandang Tengah'),
        ('CAM', 'Gelandang Serang'),
        ('RM', 'Gelandang Kanan'),
        ('LM', 'Gelandang Kiri'),
        ('RW', 'Sayap Kanan'),
        ('LW', 'Sayap Kiri'),
        ('ST', 'Penyerang'),
        ('CF', 'Penyerang Tengah')
    `);

    // Kelompok umur default
    await tx.execute(sql`
      INSERT INTO kelompok_umur (nama, usia_min, usia_max) VALUES
        ('U-6', 4, 6),
        ('U-8', 7, 8),
        ('U-10', 9, 10),
        ('U-12', 11, 12),
        ('U-14', 13, 14),
        ('U-16', 15, 16),
        ('U-18', 17, 18)
    `);
  }

  /**
   * Hapus tenant: drop seluruh schema
   */
  async deleteTenant(akademiSlug: string): Promise<void> {
    const db = this.dbService.db;
    const schemaName = `tenant_${akademiSlug}`;
    this.logger.warn(`Dropping tenant schema: ${schemaName}`);

    await db.execute(sql`DROP SCHEMA IF EXISTS ${sql.identifier(schemaName)} CASCADE`);

    this.logger.log(`Tenant ${schemaName} dropped successfully`);
  }

  /**
   * Jalankan migrasi ke semua tenant schema
   */
  async migrateAllTenants(migrationSQL: string): Promise<void> {
    const db = this.dbService.db;
    const activeAkademis = await db
      .select({ slug: akademi.slug })
      .from(akademi)
      .where(eq(akademi.isActive, true));

    for (const { slug } of activeAkademis) {
      const schemaName = `tenant_${slug}`;
      this.logger.log(`Migrating: ${schemaName}`);

      await db.transaction(async (tx) => {
        await tx.execute(sql`SET LOCAL search_path TO ${sql.identifier(schemaName)}, public`);
        await tx.execute(sql.raw(migrationSQL));
      });
    }

    this.logger.log(`Migration completed for ${activeAkademis.length} tenants`);
  }
}
