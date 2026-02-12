import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "nml5222600@mail.ru" },
    update: {},
    create: {
      email: "nml5222600@mail.ru",
      password: "nmL9309706-",
      name: "Администратор",
      phone: "+7 (999) 123-45-67",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      role: "admin",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create or link TeamMember for admin
  await prisma.teamMember.upsert({
    where: { email: "nml5222600@mail.ru" },
    update: { userId: admin.id },
    create: {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: "Администратор",
      avatar: admin.avatar,
      isAdmin: true,
      userId: admin.id,
    },
  });
  console.log("Linked admin TeamMember");

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      registrationMode: "open",
      allowPasswordReset: true,
      maxLoginAttempts: 5,
    },
  });
  console.log("Created system settings");

  // Create default project
  const project = await prisma.project.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Основной проект",
      description: "Проект по умолчанию",
    },
  });
  console.log("Created default project:", project.name);

  // Create default columns
  const columns = [
    { id: "todo", name: { ru: "К выполнению", en: "To Do" }, color: "from-slate-500 to-slate-600", order: 0 },
    { id: "inProgress", name: { ru: "В работе", en: "In Progress" }, color: "from-blue-500 to-indigo-500", order: 1 },
    { id: "review", name: { ru: "На проверке", en: "Review" }, color: "from-amber-500 to-orange-500", order: 2 },
    { id: "done", name: { ru: "Готово", en: "Done" }, color: "from-emerald-500 to-green-500", order: 3, isArchiveColumn: true },
  ];

  for (const col of columns) {
    await prisma.projectColumn.upsert({
      where: { id: col.id },
      update: {},
      create: {
        id: col.id,
        name: JSON.stringify(col.name),
        color: col.color,
        order: col.order,
        isArchiveColumn: col.isArchiveColumn || false,
        projectId: "default",
      },
    });
  }
  console.log("Created default columns");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
