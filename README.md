# nmL Flow - CRM & Project Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

**Современная система управления проектами и CRM для команд**

[🇷🇺 Русский](#-русская-документация) | [🇬🇧 English](#-english-documentation)

</div>

---

## 🇷🇺 Русская документация

### 📖 Описание

**nmL Flow** — полнофункциональная система управления проектами и CRM, разработанная для малого и среднего бизнеса. Включает веб-панель администратора и мобильное приложение для Android.

### ✨ Возможности

#### 📋 Управление проектами
- Канбан-доски с настраиваемыми колонками
- Создание и назначение задач
- Приоритеты и дедлайны
- Комментарии и вложения
- Архивация завершенных задач

#### 👥 Управление командой
- Профили сотрудников
- Отслеживание рабочих дней
- Автоматический расчет зарплаты
- Статистика активности
- Онлайн-статус

#### 💼 CRM система
- Управление лидами
- Воронка продаж
- История взаимодействий
- Назначение ответственных

#### 💬 Коммуникации
- Командный чат
- Push-уведомления (Firebase)
- Календарь с заметками

#### 📊 Аналитика
- Диаграммы активности команды
- Статистика по проектам
- Отчеты по задачам

### 🔧 Технологии

**Backend:**
- Next.js 16
- Prisma ORM
- SQLite
- Node.js 20+

**Frontend (Web):**
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

**Mobile:**
- React Native
- Expo
- TypeScript

### 📋 Требования

Перед установкой убедитесь, что у вас установлено:

- **Node.js** 20.x или выше
- **npm** или **yarn**
- **Git**
- **SQLite** (встроен в систему)

### 🚀 Установка из исходников

#### 1. Клонируйте репозиторий

```bash
git clone https://github.com/yourusername/nmlflow-server.git
cd nmlflow-server
```

#### 2. Установите зависимости

```bash
npm install
```

#### 3. Настройте переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Firebase Cloud Messaging Server Key
# Получить в Firebase Console -> Project Settings -> Cloud Messaging -> Server key
FCM_SERVER_KEY=your_fcm_server_key_here
```

#### 4. Инициализируйте базу данных

```bash
npx prisma generate
npx prisma db push
```

#### 5. (Опционально) Создайте демо-данные

```bash
node seed-demo.js
```

Это создаст:
- 1 администратора: `demo-admin@demo.ru` / `demo123`
- 3 сотрудников: `demo1@demo.ru`, `demo2@demo.ru`, `demo3@demo.ru` / `demo123`
- Тестовые задачи, проекты, лиды

#### 6. Запустите сервер

**Режим разработки:**
```bash
npm run dev
```

**Production режим:**
```bash
npm run build
npm start
```

Сервер будет доступен по адресу: `http://localhost:3000`

### 🐳 Установка через Docker

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/nmlflow-server.git
cd nmlflow-server

# Соберите образ
docker build -t nmlflow-server .

# Запустите контейнер
docker run -d -p 3000:3000 --name nmlflow nmlflow-server
```

### 🔐 Настройка Firebase (Push-уведомления)

#### 1. Создайте проект в Firebase Console

Перейдите на [Firebase Console](https://console.firebase.google.com/) и создайте новый проект.

#### 2. Получите Server Key

1. Откройте **Project Settings** (⚙️)
2. Перейдите на вкладку **Cloud Messaging**
3. Скопируйте **Server key**
4. Добавьте в `.env`:

```env
FCM_SERVER_KEY=ваш_server_key
```

#### 3. Скачайте google-services.json

1. В **Project Settings** → **General**
2. Добавьте Android приложение
3. Скачайте `google-services.json`
4. Поместите в корень мобильного приложения

### 📱 Настройка мобильного приложения

#### 1. Клонируйте репозиторий мобильного приложения

```bash
git clone https://github.com/yourusername/nmlflow-app.git
cd nmlflow-app
```

#### 2. Установите зависимости

```bash
npm install
```

#### 3. Настройте URL сервера

Откройте `constants/api.ts` и укажите адрес вашего сервера:

```typescript
export const API_BASE_URL = 'https://your-domain.com'; // Замените на ваш домен
```

#### 4. Добавьте google-services.json

Поместите файл `google-services.json` в корень проекта.

#### 5. Соберите приложение

**Для разработки:**
```bash
npx expo start
```

**Для production (APK):**
```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

APK будет находиться в `android/app/build/outputs/apk/release/`

### 🔑 Первый запуск

#### Создание администратора

При первом запуске система работает в режиме **открытой регистрации**. 

1. Откройте веб-панель: `http://your-server:3000`
2. Зарегистрируйте первого пользователя
3. Откройте базу данных:

```bash
npx prisma studio
```

4. В таблице `User` измените поле `role` на `admin` для вашего пользователя
5. Перезапустите сервер

#### Настройка режима регистрации

В веб-панели перейдите в **Настройки** → **Система** и выберите:
- **Открытая** - любой может зарегистрироваться
- **По приглашениям** - только с инвайт-кодом
- **Закрытая** - регистрация отключена

### 📊 Использование

#### Веб-панель администратора

Откройте `http://your-server:3000` в браузере.

**Основные функции:**
- Управление пользователями и командой
- Создание проектов и задач
- Просмотр аналитики
- Управление лидами (CRM)
- Настройка системы

#### Мобильное приложение

1. Установите APK на Android устройство
2. При первом запуске введите URL сервера
3. Войдите с учетными данными

**Основные функции:**
- Просмотр и управление задачами
- Командный чат
- Отметка рабочих дней
- Просмотр зарплаты
- Push-уведомления

### 🛠️ Настройка

#### Изменение порта

В `package.json` измените скрипт `start`:

```json
"start": "next start -p 8080"
```

#### Настройка базы данных

По умолчанию используется SQLite. Для использования PostgreSQL или MySQL:

1. Измените `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Добавьте в `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nmlflow"
```

3. Примените миграции:

```bash
npx prisma migrate dev
```

### 🔄 Обновление

```bash
# Остановите сервер
# Получите последние изменения
git pull origin main

# Обновите зависимости
npm install

# Примените миграции базы данных
npx prisma migrate deploy

# Пересоберите проект
npm run build

# Запустите сервер
npm start
```

### 🐛 Решение проблем

#### Ошибка подключения к базе данных

```bash
# Пересоздайте базу данных
rm prisma/dev.db
npx prisma db push
```

#### Push-уведомления не работают

1. Проверьте `FCM_SERVER_KEY` в `.env`
2. Убедитесь что `google-services.json` в мобильном приложении
3. Проверьте что приложение собрано с правильным `google-services.json`

#### Порт уже занят

```bash
# Найдите процесс на порту 3000
lsof -i :3000

# Остановите процесс
kill -9 <PID>
```

### 📝 Лицензия

MIT License - свободно используйте в коммерческих и личных проектах.

### 🤝 Поддержка

- 📧 Email: support@nmlflow.com
- 💬 Telegram: @nmlflow
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nmlflow-server/issues)

### 🌟 Вклад в проект

Мы приветствуем вклад в развитие проекта! 

1. Fork репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 🇬🇧 English Documentation

### 📖 Description

**nmL Flow** is a full-featured project management and CRM system designed for small and medium-sized businesses. Includes a web admin panel and Android mobile application.

### ✨ Features

#### 📋 Project Management
- Kanban boards with customizable columns
- Task creation and assignment
- Priorities and deadlines
- Comments and attachments
- Archive completed tasks

#### 👥 Team Management
- Employee profiles
- Work day tracking
- Automatic salary calculation
- Activity statistics
- Online status

#### 💼 CRM System
- Lead management
- Sales funnel
- Interaction history
- Assign responsible persons

#### 💬 Communications
- Team chat
- Push notifications (Firebase)
- Calendar with notes

#### 📊 Analytics
- Team activity charts
- Project statistics
- Task reports

### 🔧 Technologies

**Backend:**
- Next.js 16
- Prisma ORM
- SQLite
- Node.js 20+

**Frontend (Web):**
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

**Mobile:**
- React Native
- Expo
- TypeScript

### 📋 Requirements

Before installation, make sure you have:

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Git**
- **SQLite** (built-in)

### 🚀 Installation from Source

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/nmlflow-server.git
cd nmlflow-server
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Create `.env` file in project root:

```env
# Firebase Cloud Messaging Server Key
# Get it from Firebase Console -> Project Settings -> Cloud Messaging -> Server key
FCM_SERVER_KEY=your_fcm_server_key_here
```

#### 4. Initialize database

```bash
npx prisma generate
npx prisma db push
```

#### 5. (Optional) Create demo data

```bash
node seed-demo.js
```

This will create:
- 1 administrator: `demo-admin@demo.ru` / `demo123`
- 3 employees: `demo1@demo.ru`, `demo2@demo.ru`, `demo3@demo.ru` / `demo123`
- Test tasks, projects, leads

#### 6. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server will be available at: `http://localhost:3000`

### 🐳 Docker Installation

```bash
# Clone repository
git clone https://github.com/yourusername/nmlflow-server.git
cd nmlflow-server

# Build image
docker build -t nmlflow-server .

# Run container
docker run -d -p 3000:3000 --name nmlflow nmlflow-server
```

### 🔐 Firebase Setup (Push Notifications)

#### 1. Create project in Firebase Console

Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.

#### 2. Get Server Key

1. Open **Project Settings** (⚙️)
2. Go to **Cloud Messaging** tab
3. Copy **Server key**
4. Add to `.env`:

```env
FCM_SERVER_KEY=your_server_key
```

#### 3. Download google-services.json

1. In **Project Settings** → **General**
2. Add Android application
3. Download `google-services.json`
4. Place in mobile app root

### 📱 Mobile App Setup

#### 1. Clone mobile app repository

```bash
git clone https://github.com/yourusername/nmlflow-app.git
cd nmlflow-app
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure server URL

Open `constants/api.ts` and specify your server address:

```typescript
export const API_BASE_URL = 'https://your-domain.com'; // Replace with your domain
```

#### 4. Add google-services.json

Place `google-services.json` file in project root.

#### 5. Build application

**For development:**
```bash
npx expo start
```

**For production (APK):**
```bash
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

APK will be located in `android/app/build/outputs/apk/release/`

### 🔑 First Run

#### Creating Administrator

On first run, system works in **open registration** mode.

1. Open web panel: `http://your-server:3000`
2. Register first user
3. Open database:

```bash
npx prisma studio
```

4. In `User` table, change `role` field to `admin` for your user
5. Restart server

#### Configure Registration Mode

In web panel go to **Settings** → **System** and choose:
- **Open** - anyone can register
- **Invite-only** - only with invite code
- **Closed** - registration disabled

### 📊 Usage

#### Web Admin Panel

Open `http://your-server:3000` in browser.

**Main features:**
- User and team management
- Create projects and tasks
- View analytics
- Manage leads (CRM)
- System settings

#### Mobile Application

1. Install APK on Android device
2. On first launch, enter server URL
3. Login with credentials

**Main features:**
- View and manage tasks
- Team chat
- Mark work days
- View salary
- Push notifications

### 🛠️ Configuration

#### Change Port

In `package.json` modify `start` script:

```json
"start": "next start -p 8080"
```

#### Database Configuration

SQLite is used by default. To use PostgreSQL or MySQL:

1. Modify `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Add to `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nmlflow"
```

3. Apply migrations:

```bash
npx prisma migrate dev
```

### 🔄 Updating

```bash
# Stop server
# Get latest changes
git pull origin main

# Update dependencies
npm install

# Apply database migrations
npx prisma migrate deploy

# Rebuild project
npm run build

# Start server
npm start
```

### 🐛 Troubleshooting

#### Database Connection Error

```bash
# Recreate database
rm prisma/dev.db
npx prisma db push
```

#### Push Notifications Not Working

1. Check `FCM_SERVER_KEY` in `.env`
2. Ensure `google-services.json` is in mobile app
3. Verify app is built with correct `google-services.json`

#### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Stop process
kill -9 <PID>
```

### 📝 License

MIT License - free to use in commercial and personal projects.

### 🤝 Support

- 📧 Email: support@nmlflow.com
- 💬 Telegram: @nmlflow
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nmlflow-server/issues)

### 🌟 Contributing

We welcome contributions!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

<div align="center">

Made with ❤️ by nmL Flow Team

[⭐ Star this repo](https://github.com/yourusername/nmlflow-server) | [🐛 Report Bug](https://github.com/yourusername/nmlflow-server/issues) | [💡 Request Feature](https://github.com/yourusername/nmlflow-server/issues)

</div>
