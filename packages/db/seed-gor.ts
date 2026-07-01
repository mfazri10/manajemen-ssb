import { db, permissions, permissionRoles, roles, menus } from './src/index';
import { eq } from 'drizzle-orm';

/**
 * Seed idempotent untuk modul GOR & Lapangan (Fase G1).
 * - Mendaftarkan permission gor.* & lapangan.* ke tabel permissions
 * - Memberikan permission tsb ke role yang sudah punya 'siswa.index' (role admin);
 *   jika tidak ada, diberikan ke semua role.
 * - Menambahkan menu Manajemen GOR (induk) + Data GOR & Data Lapangan.
 * Aman dijalankan berulang kali.
 */

const PERMS = [
  { name: 'gor.index', label: 'Lihat GOR' },
  { name: 'gor.create', label: 'Tambah GOR' },
  { name: 'gor.update', label: 'Ubah GOR' },
  { name: 'gor.delete', label: 'Hapus GOR' },
  { name: 'lapangan.index', label: 'Lihat Lapangan' },
  { name: 'lapangan.create', label: 'Tambah Lapangan' },
  { name: 'lapangan.update', label: 'Ubah Lapangan' },
  { name: 'lapangan.delete', label: 'Hapus Lapangan' },
];

async function main() {
  console.log('🌱 Seeding permission & menu GOR/Lapangan...');

  // 1. Insert permissions (idempotent)
  for (const p of PERMS) {
    await db.insert(permissions).values(p).onConflictDoNothing({ target: permissions.name });
  }
  const permRows = await db.select().from(permissions);
  const newPermIds = permRows.filter((r) => PERMS.some((p) => p.name === r.name)).map((r) => r.id);
  console.log(`  ✓ ${newPermIds.length} permission tersedia`);

  // 2. Tentukan role penerima: role yang punya 'siswa.index', fallback ke semua role
  const siswaPerm = permRows.find((r) => r.name === 'siswa.index');
  let targetRoleIds: number[] = [];
  if (siswaPerm) {
    const pr = await db.select().from(permissionRoles).where(eq(permissionRoles.permissionId, siswaPerm.id));
    targetRoleIds = pr.map((x) => x.roleId);
  }
  if (targetRoleIds.length === 0) {
    const allRoles = await db.select().from(roles);
    targetRoleIds = allRoles.map((r) => r.id);
  }
  console.log(`  ✓ Memberikan ke ${targetRoleIds.length} role`);

  // 3. Assign permission ke role (cek dulu agar idempotent)
  const existingPR = await db.select().from(permissionRoles);
  const has = (permId: number, roleId: number) =>
    existingPR.some((x) => x.permissionId === permId && x.roleId === roleId);
  for (const roleId of targetRoleIds) {
    for (const permId of newPermIds) {
      if (!has(permId, roleId)) {
        await db.insert(permissionRoles).values({ permissionId: permId, roleId });
      }
    }
  }

  // 4. Menu (idempotent by slug)
  await db.insert(menus).values({
    name: 'Manajemen GOR', route: '#', icon: 'Building2', orderNo: 90, slug: 'gor-management',
  }).onConflictDoNothing({ target: menus.slug });
  const parent = (await db.select().from(menus).where(eq(menus.slug, 'gor-management')))[0];
  const children = [
    { name: 'Data GOR', route: '/admin/gor', icon: 'Building2', orderNo: 1, slug: 'gor', parentId: parent?.id },
    { name: 'Data Lapangan', route: '/admin/lapangan', icon: 'LayoutGrid', orderNo: 2, slug: 'lapangan', parentId: parent?.id },
  ];
  for (const m of children) {
    await db.insert(menus).values(m).onConflictDoNothing({ target: menus.slug });
  }
  console.log('  ✓ Menu GOR & Lapangan siap');

  console.log('✅ Seed GOR/Lapangan selesai');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seed gagal:', e);
  process.exit(1);
});
