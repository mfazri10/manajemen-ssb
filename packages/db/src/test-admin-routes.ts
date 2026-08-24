async function testAdminRoutes() {
  console.log('--- Testing All 33 Admin Routes on Next.js Server ---');

  const baseUrl = 'http://localhost:3002';
  const routes = [
    '/admin/dashboard',
    '/admin/siswa',
    '/admin/pelatih',
    '/admin/jadwal',
    '/admin/absensi',
    '/admin/spp',
    '/admin/buku-kas',
    '/admin/tabungan',
    '/admin/evaluasi',
    '/admin/tes-fisik',
    '/admin/inventaris',
    '/admin/turnamen',
    '/admin/match',
    '/admin/materi',
    '/admin/log-pelatih',
    '/admin/kelompok-umur',
    '/admin/posisi',
    '/admin/pelanggaran',
    '/admin/grup',
    '/admin/gor',
    '/admin/lapangan',
    '/admin/pendaftaran',
    '/admin/seleksi',
    '/admin/pengumuman',
    '/admin/notifikasi',
    '/admin/users',
    '/admin/roles',
    '/admin/menu',
    '/admin/fitur',
    '/admin/affiliate',
    '/admin/audit-log',
    '/admin/langganan',
    '/admin/payment',
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.status === 200) {
        console.log(`  ✓ Route '${route}' returned Status 200 OK`);
        passedCount++;
      } else {
        console.error(`  ✗ Route '${route}' returned Status ${res.status}`);
        failedCount++;
      }
    } catch (err: any) {
      console.error(`  ✗ Route '${route}' FAILED to load: ${err.message}`);
      failedCount++;
    }
  }

  console.log(`\n--- Admin Route Verification Summary ---`);
  console.log(`Total Routes Tested: ${routes.length}`);
  console.log(`Passed (200 OK)    : ${passedCount}`);
  console.log(`Failed             : ${failedCount}`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

testAdminRoutes();
