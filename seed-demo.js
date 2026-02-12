const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Создание демо-данных...');

  // Получаем существующие проекты
  const projects = await prisma.project.findMany({
    include: { columns: true }
  });

  if (projects.length === 0) {
    console.error('❌ Нет проектов в базе. Сначала создайте проекты.');
    return;
  }

  const project = projects[0];
  const columns = project.columns;

  // 1. Создаем демо-пользователей
  console.log('👥 Создание пользователей...');
  
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Демо-Админ
  const adminUser = await prisma.user.upsert({
    where: { email: 'demo-admin@demo.ru' },
    update: {},
    create: {
      email: 'demo-admin@demo.ru',
      password: hashedPassword,
      name: 'Демо Администратор',
      role: 'admin',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=DemoAdmin',
    },
  });

  // Создаем TeamMember для админа
  const adminMember = await prisma.teamMember.upsert({
    where: { email: 'demo-admin@demo.ru' },
    update: {},
    create: {
      name: 'Демо Администратор',
      email: 'demo-admin@demo.ru',
      phone: '+7 (900) 000-00-01',
      role: 'Руководитель',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=DemoAdmin',
      isAdmin: true,
      isOnline: true,
      dailyRate: 5000,
      carBonus: 1000,
      userId: adminUser.id,
    },
  });

  // Демо-Сотрудники
  const demoUsers = [
    {
      email: 'demo1@demo.ru',
      name: 'Алексей Демонов',
      role: 'Менеджер',
      phone: '+7 (900) 111-11-11',
      dailyRate: 3000,
      carBonus: 500,
    },
    {
      email: 'demo2@demo.ru',
      name: 'Мария Тестова',
      role: 'Специалист',
      phone: '+7 (900) 222-22-22',
      dailyRate: 2500,
      carBonus: 500,
    },
    {
      email: 'demo3@demo.ru',
      name: 'Иван Примеров',
      role: 'Техник',
      phone: '+7 (900) 333-33-33',
      dailyRate: 2800,
      carBonus: 500,
    },
  ];

  const members = [];
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: 'user',
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.name}`,
      },
    });

    const member = await prisma.teamMember.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.name}`,
        isAdmin: false,
        isOnline: Math.random() > 0.5,
        dailyRate: userData.dailyRate,
        carBonus: userData.carBonus,
        userId: user.id,
      },
    });

    members.push({ user, member });
  }

  console.log(`✅ Создано ${members.length + 1} пользователей`);

  // 2. Создаем задачи
  console.log('📋 Создание задач...');
  
  const taskTemplates = [
    {
      title: 'Настроить сервер для клиента',
      description: 'Установить и настроить веб-сервер nginx, настроить SSL сертификаты',
      address: 'ул. Ленина, 15, офис 301',
      phone: '+7 (495) 123-45-67',
      priority: 'high',
      status: columns[0]?.id || 'todo',
    },
    {
      title: 'Провести техническую консультацию',
      description: 'Консультация по выбору оборудования для офиса',
      address: 'пр. Мира, 88',
      phone: '+7 (495) 234-56-78',
      priority: 'medium',
      status: columns[0]?.id || 'todo',
    },
    {
      title: 'Установить программное обеспечение',
      description: 'Установка 1С:Предприятие и настройка рабочих мест',
      address: 'ул. Пушкина, 42',
      phone: '+7 (495) 345-67-89',
      priority: 'high',
      status: columns[1]?.id || 'in-progress',
    },
    {
      title: 'Ремонт компьютера',
      description: 'Замена блока питания, чистка от пыли',
      address: 'ул. Гагарина, 7',
      phone: '+7 (495) 456-78-90',
      priority: 'low',
      status: columns[1]?.id || 'in-progress',
    },
    {
      title: 'Настройка сетевого оборудования',
      description: 'Настройка роутера и коммутатора, организация локальной сети',
      address: 'ул. Советская, 23',
      phone: '+7 (495) 567-89-01',
      priority: 'medium',
      status: columns[1]?.id || 'in-progress',
    },
    {
      title: 'Восстановление данных',
      description: 'Восстановление файлов с поврежденного жесткого диска',
      address: 'ул. Кирова, 56',
      phone: '+7 (495) 678-90-12',
      priority: 'high',
      status: columns[2]?.id || 'done',
    },
    {
      title: 'Установка антивируса',
      description: 'Установка и настройка корпоративного антивируса на 10 компьютеров',
      address: 'пр. Победы, 12',
      phone: '+7 (495) 789-01-23',
      priority: 'low',
      status: columns[2]?.id || 'done',
    },
    {
      title: 'Обновление системы',
      description: 'Обновление Windows и установка критических патчей безопасности',
      address: 'ул. Чехова, 34',
      phone: '+7 (495) 890-12-34',
      priority: 'medium',
      status: columns[2]?.id || 'done',
    },
  ];

  const tasks = [];
  for (let i = 0; i < taskTemplates.length; i++) {
    const template = taskTemplates[i];
    const assignee = members[i % members.length];
    
    const task = await prisma.task.create({
      data: {
        title: template.title,
        description: template.description,
        address: template.address,
        phone: template.phone,
        priority: template.priority,
        projectId: project.id,
        columnId: template.status,
        order: i,
        tags: JSON.stringify(['демо', 'тест']),
      },
    });

    // Назначаем исполнителя
    await prisma.taskAssignee.create({
      data: {
        taskId: task.id,
        memberId: assignee.member.id,
      },
    });

    tasks.push({ task, assignee });
  }

  console.log(`✅ Создано ${tasks.length} задач`);

  // 3. Создаем комментарии
  console.log('💬 Создание комментариев...');
  
  const comments = [
    'Начал работу над задачей',
    'Связался с клиентом, уточнил детали',
    'Выполнено 50% работы',
    'Возникли сложности, нужна консультация',
    'Задача выполнена, ожидаю проверки',
    'Все готово, клиент доволен',
  ];

  let commentCount = 0;
  for (const { task, assignee } of tasks.slice(0, 5)) {
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numComments; i++) {
      await prisma.comment.create({
        data: {
          text: comments[Math.floor(Math.random() * comments.length)],
          taskId: task.id,
          authorId: assignee.user.id,
        },
      });
      commentCount++;
    }
  }

  console.log(`✅ Создано ${commentCount} комментариев`);

  // 4. Создаем активность
  console.log('📊 Создание записей активности...');
  
  const actions = ['created', 'updated', 'commented', 'completed'];
  
  // Создаем активность для каждого пользователя с разным количеством
  const activityDistribution = [
    { user: adminUser, member: adminMember, count: 80 },  // Админ - 80 действий
    { user: members[0].user, member: members[0].member, count: 70 },  // Алексей - 70
    { user: members[1].user, member: members[1].member, count: 50 },  // Мария - 50
    { user: members[2].user, member: members[2].member, count: 45 },  // Иван - 45
  ];
  
  let totalActivityCount = 0;
  
  for (const { user, member, count } of activityDistribution) {
    for (let i = 0; i < count; i++) {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      await prisma.activity.create({
        data: {
          type: 'task',
          action: action,
          subject: randomTask.task.title,
          targetId: randomTask.task.id,
          projectId: project.id,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Последние 7 дней
        },
      });
      totalActivityCount++;
    }
  }

  console.log(`✅ Создано ${totalActivityCount} записей активности`);

  // 5. Создаем рабочие дни
  console.log('📅 Создание рабочих дней...');
  
  const today = new Date();
  let workDayCount = 0;
  
  for (const { member } of members) {
    // Создаем рабочие дни за последние 30 дней
    for (let i = 0; i < 30; i++) {
      if (Math.random() > 0.3) { // 70% вероятность рабочего дня
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          await prisma.workDay.create({
            data: {
              date: dateStr,
              memberId: member.id,
              userId: member.userId,
              withCar: Math.random() > 0.7,
              isDouble: Math.random() > 0.9,
            },
          });
          workDayCount++;
        } catch (e) {
          // Игнорируем дубликаты
        }
      }
    }
  }

  console.log(`✅ Создано ${workDayCount} рабочих дней`);

  // 6. Создаем лиды в CRM
  console.log('🎯 Создание лидов...');
  
  const leadTemplates = [
    {
      name: 'ООО "Рога и Копыта"',
      company: 'ООО "Рога и Копыта"',
      email: 'info@rogaikopyta.ru',
      phone: '+7 (495) 111-22-33',
      address: 'г. Москва, ул. Примерная, 1',
      value: 150000,
      status: 'leads',
    },
    {
      name: 'ИП Иванов',
      company: 'ИП Иванов И.И.',
      email: 'ivanov@example.com',
      phone: '+7 (495) 222-33-44',
      address: 'г. Москва, ул. Тестовая, 2',
      value: 75000,
      status: 'negotiation',
    },
    {
      name: 'АО "Технологии"',
      company: 'АО "Технологии будущего"',
      email: 'contact@techno.ru',
      phone: '+7 (495) 333-44-55',
      address: 'г. Москва, пр. Инновационный, 3',
      value: 250000,
      status: 'proposal',
    },
  ];

  for (const leadData of leadTemplates) {
    const assignee = members[Math.floor(Math.random() * members.length)];
    
    await prisma.lead.create({
      data: {
        ...leadData,
        assigneeId: assignee.member.id,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${leadData.company}`,
      },
    });
  }

  console.log(`✅ Создано ${leadTemplates.length} лидов`);

  // 7. Создаем сообщения в чате
  console.log('💬 Создание сообщений в чате...');
  
  const chatMessages = [
    'Всем привет! Это демо-чат',
    'Отличная система для управления проектами',
    'Кто-нибудь может помочь с задачей?',
    'Спасибо за помощь!',
    'Завтра планерка в 10:00',
  ];

  for (let i = 0; i < chatMessages.length; i++) {
    const randomUser = [adminUser, ...members.map(m => m.user)][Math.floor(Math.random() * (members.length + 1))];
    
    await prisma.chatMessage.create({
      data: {
        text: chatMessages[i],
        authorId: randomUser.id,
        createdAt: new Date(Date.now() - (chatMessages.length - i) * 60 * 60 * 1000),
      },
    });
  }

  console.log(`✅ Создано ${chatMessages.length} сообщений в чате`);

  console.log('\n🎉 Демо-данные успешно созданы!');
  console.log('\n📝 Учетные данные для входа:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Администратор:');
  console.log('   Email: demo-admin@demo.ru');
  console.log('   Пароль: demo123');
  console.log('\n👥 Сотрудники:');
  console.log('   Email: demo1@demo.ru | Пароль: demo123');
  console.log('   Email: demo2@demo.ru | Пароль: demo123');
  console.log('   Email: demo3@demo.ru | Пароль: demo123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
