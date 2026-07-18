import { hashPassword, verifyPassword } from 'better-auth/crypto';

const hashInDb = "9d720dd71400d76c99aabb0ef6b2aa2f:51275a0082ad5c2bd1b3ac22f182225bbd1cbe87a727d4498b3593b2227019ac8f0ca4ffcba2a1dbcf1c9214170f44742b7b4f726ac7fcf0279b950d9bd493f4";

const candidates = [
  'admin123',
  'admin',
  'password',
  'superadmin',
  'admin@ssb.com',
  '123456',
  '12345678',
  'ssb123',
  'bintang123',
  'adminssb',
];

async function main() {
  for (const candidate of candidates) {
    const isMatch = await verifyPassword({
      hash: hashInDb,
      password: candidate,
    });
    console.log(`Password: "${candidate}" -> Match: ${isMatch}`);
  }
}

main().catch(console.error);
