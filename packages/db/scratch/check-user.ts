import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      roleUsers: {
        include: {
          role: true
        }
      }
    }
  });
  console.log('USERS IN DB:', JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
