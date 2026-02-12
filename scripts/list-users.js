const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== USERS (аккаунты для входа) ===');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  console.table(users);

  console.log('\n=== TEAM MEMBERS (сотрудники) ===');
  const members = await prisma.teamMember.findMany({
    select: { id: true, email: true, name: true, isAdmin: true, userId: true }
  });
  console.table(members);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
