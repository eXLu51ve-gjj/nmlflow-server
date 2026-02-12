const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/delete-user.js <email>');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User with email ${email} not found`);
    return;
  }

  const userId = user.id;

  // Delete all related records first
  await prisma.activity.deleteMany({ where: { userId } });
  await prisma.comment.deleteMany({ where: { authorId: userId } });
  await prisma.leadComment.deleteMany({ where: { authorId: userId } });
  await prisma.workDay.deleteMany({ where: { userId } });
  await prisma.chatMessage.deleteMany({ where: { authorId: userId } });
  await prisma.chatAccess.deleteMany({ where: { userId } });
  await prisma.userSettings.deleteMany({ where: { userId } });
  await prisma.teamMember.deleteMany({ where: { userId } });

  // Now delete user
  await prisma.user.delete({ where: { email } });
  console.log(`Deleted user: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
