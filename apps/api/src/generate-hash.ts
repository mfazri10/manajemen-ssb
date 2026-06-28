import { hashPassword } from 'better-auth/crypto';

async function main() {
  const hash = await hashPassword('admin123');
  console.log('PASSWORD_HASH:', hash);
}

main();
