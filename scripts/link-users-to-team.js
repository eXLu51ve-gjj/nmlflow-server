// Script to link existing Users to TeamMembers by email
// Run: node scripts/link-users-to-team.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Linking Users to TeamMembers...");

  // Get all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users`);

  for (const user of users) {
    // Find TeamMember with same email
    const teamMember = await prisma.teamMember.findUnique({
      where: { email: user.email.toLowerCase() },
    });

    if (teamMember) {
      if (!teamMember.userId) {
        // Link TeamMember to User
        await prisma.teamMember.update({
          where: { id: teamMember.id },
          data: { userId: user.id },
        });
        console.log(`Linked: ${user.email} -> TeamMember ${teamMember.id}`);
      } else {
        console.log(`Already linked: ${user.email}`);
      }
    } else {
      // Create TeamMember for this user
      const newMember = await prisma.teamMember.create({
        data: {
          name: user.name,
          email: user.email.toLowerCase(),
          phone: user.phone || "",
          role: user.role === "admin" ? "Администратор" : "Сотрудник",
          avatar: user.avatar || "",
          isAdmin: user.role === "admin",
          userId: user.id,
        },
      });
      console.log(`Created TeamMember for: ${user.email} -> ${newMember.id}`);
    }
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
