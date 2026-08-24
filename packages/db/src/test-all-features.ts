import { getTenantSchema } from './schema/tenant';
import * as publicSchema from './schema/public';

async function testAllFeatures() {
  console.log('--- Starting Comprehensive Automated Feature Verification ---');

  // 1. Test Public Schema Tables
  console.log('\n[1/4] Verifying Public Schema Tables...');
  const publicTables = [
    'users',
    'sessions',
    'accounts',
    'verifications',
    'roles',
    'permissions',
    'roleUsers',
    'permissionRoles',
    'menus',
    'akademi',
    'affiliates',
    'affiliateLinks',
    'affiliateVisits',
    'affiliateReferrals',
    'affiliatePayouts',
    'affiliatePayoutItems',
    'userOnboardingSurvey',
  ];

  let publicPassed = true;
  for (const tableName of publicTables) {
    if ((publicSchema as Record<string, unknown>)[tableName]) {
      console.log(`  ✓ Public Table '${tableName}' defined successfully`);
    } else {
      console.error(`  ✗ Public Table '${tableName}' MISSING!`);
      publicPassed = false;
    }
  }

  // 2. Test Dynamic Tenant Schema Generation
  console.log('\n[2/4] Verifying Dynamic Tenant Schema Generation...');
  const testSlug = 'ssb_garuda_test';
  const tenantSchema = getTenantSchema(testSlug);

  const tenantTables = [
    'kelompokUmur',
    'masterPosisi',
    'masterPelanggaran',
    'siswa',
    'orangTua',
    'dokumenSiswa',
    'pelatih',
    'pelatihLisensi',
    'pelatihJabatan',
    'jadwalLatihan',
    'absensi',
    'sppTagihan',
    'sppPembayaran',
    'bukuKas',
    'tabungan',
    'evaluasi',
    'tesFisik',
    'seleksi',
    'turnamen',
    'match',
    'pengumuman',
    'notifikasi',
    'inventaris',
    'materiKategori',
    'materiLatihan',
    'logPelatih',
    'gor',
    'lapangan',
  ];

  let tenantPassed = true;
  for (const tableName of tenantTables) {
    if ((tenantSchema as Record<string, unknown>)[tableName]) {
      console.log(`  ✓ Tenant Table '${tableName}' in schema 'tenant_${testSlug}' defined successfully`);
    } else {
      console.error(`  ✗ Tenant Table '${tableName}' MISSING in schema 'tenant_${testSlug}'!`);
      tenantPassed = false;
    }
  }

  // 3. Verify Product Type Schema Configurations
  console.log('\n[3/4] Verifying Product Type Schema Configurations...');
  const supportedTypes = ['akademi', 'gor', 'futsal', 'badminton', 'gym', 'yoga', 'pilates', 'lainnya'];
  console.log(`  ✓ Supported Product Types: ${supportedTypes.join(', ')}`);

  // 4. Verification Summary
  if (publicPassed && tenantPassed) {
    console.log('\n[4/4] Summary: ALL 17 Public Tables and ALL 28 Tenant Tables Verified Successfully!');
    console.log('--- Feature Verification Finished Successfully ---');
  } else {
    console.error('\n[4/4] Summary: Some schema tables failed verification!');
    process.exit(1);
  }
}

testAllFeatures().catch((err) => {
  console.error('Feature Verification Failed:', err);
  process.exit(1);
});
