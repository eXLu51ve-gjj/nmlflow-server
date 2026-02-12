# Инструкция по загрузке на GitHub

## Подготовка

### 1. Создайте аккаунт на GitHub (если нет)

Перейдите на [github.com](https://github.com) и зарегистрируйтесь.

### 2. Установите Git

**Windows:**
Скачайте с [git-scm.com](https://git-scm.com/download/win)

**Проверка установки:**
```bash
git --version
```

### 3. Настройте Git

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "your-email@example.com"
```

## Создание репозиториев

### 1. Создайте репозиторий для сервера

1. Откройте [github.com/new](https://github.com/new)
2. Заполните:
   - **Repository name:** `nmlflow-server`
   - **Description:** `nmL Flow - CRM & Project Management System (Server)`
   - **Public** (чтобы другие могли использовать)
   - ✅ Add README file (снимите галочку, у нас уже есть)
   - **License:** MIT License
3. Нажмите **Create repository**

### 2. Создайте репозиторий для мобильного приложения

1. Откройте [github.com/new](https://github.com/new)
2. Заполните:
   - **Repository name:** `nmlflow-app`
   - **Description:** `nmL Flow - Mobile Application for Android`
   - **Public**
   - ✅ Add README file (снимите галочку)
   - **License:** MIT License
3. Нажмите **Create repository**

## Загрузка кода

### Сервер (nmlflow)

```bash
# Перейдите в папку проекта
cd D:\Project\nmlflow

# Инициализируйте Git
git init

# Добавьте все файлы
git add .

# Создайте первый коммит
git commit -m "Initial commit: nmL Flow Server v1.0.0"

# Добавьте удаленный репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nmlflow-server.git

# Загрузите код
git branch -M main
git push -u origin main
```

### Мобильное приложение (nmlflowApp)

```bash
# Перейдите в папку проекта
cd D:\Project\nmlflowApp

# Инициализируйте Git
git init

# Добавьте все файлы
git add .

# Создайте первый коммит
git commit -m "Initial commit: nmL Flow Mobile v1.0.0"

# Добавьте удаленный репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nmlflow-app.git

# Загрузите код
git branch -M main
git push -u origin main
```

## Создание Release с APK

### 1. Перейдите в репозиторий мобильного приложения

Откройте `https://github.com/YOUR_USERNAME/nmlflow-app`

### 2. Создайте новый Release

1. Нажмите **Releases** (справа)
2. Нажмите **Create a new release**
3. Заполните:
   - **Tag version:** `v1.0.0`
   - **Release title:** `nmL Flow v1.0.0 - First Release`
   - **Description:**
   
```markdown
## 🎉 Первый релиз nmL Flow!

### ✨ Основные функции
- Управление проектами и задачами
- CRM система
- Командный чат
- Учет рабочего времени и зарплаты
- Аналитика и отчеты
- Push-уведомления

### 📱 Установка
1. Скачайте APK файл ниже
2. Установите на Android устройство
3. Следуйте инструкциям в [README](https://github.com/YOUR_USERNAME/nmlflow-app)

### 🔗 Ссылки
- [Серверная часть](https://github.com/YOUR_USERNAME/nmlflow-server)
- [Документация](https://github.com/YOUR_USERNAME/nmlflow-server#readme)
- [RuStore](https://apps.rustore.ru/app/com.nmlflow.app)

### 📋 Требования
- Android 7.0+
- Сервер nmL Flow
```

4. Прикрепите APK файл:
   - Нажмите **Attach binaries**
   - Выберите `app-release.apk` из `D:\Project\nmlflowApp\android\app\build\outputs\apk\release\`
5. Нажмите **Publish release**

## Обновление README

### Замените ссылки в README файлах

В обоих README.md замените `YOUR_USERNAME` на ваш GitHub username:

**nmlflow/README.md:**
```bash
# Найдите и замените
https://github.com/yourusername/nmlflow-server
# на
https://github.com/YOUR_USERNAME/nmlflow-server
```

**nmlflowApp/README.md:**
```bash
# Найдите и замените
https://github.com/yourusername/nmlflow-app
# на
https://github.com/YOUR_USERNAME/nmlflow-app
```

### Закоммитьте изменения

```bash
# Для сервера
cd D:\Project\nmlflow
git add README.md
git commit -m "Update GitHub links in README"
git push

# Для приложения
cd D:\Project\nmlflowApp
git add README.md
git commit -m "Update GitHub links in README"
git push
```

## Настройка GitHub Pages (опционально)

Можно создать красивую страницу проекта:

1. В репозитории перейдите в **Settings**
2. Слева выберите **Pages**
3. В **Source** выберите **main** branch
4. Нажмите **Save**

Сайт будет доступен по адресу:
`https://YOUR_USERNAME.github.io/nmlflow-server/`

## Добавление Topics (теги)

Для лучшей видимости проекта:

1. На главной странице репозитория нажмите ⚙️ рядом с **About**
2. Добавьте topics:
   - `project-management`
   - `crm`
   - `kanban`
   - `react-native`
   - `nextjs`
   - `typescript`
   - `android`
   - `self-hosted`
   - `open-source`
3. Нажмите **Save changes**

## Проверка

Убедитесь что:
- ✅ Оба репозитория созданы и публичные
- ✅ Код загружен
- ✅ README отображается корректно
- ✅ APK доступен в Releases
- ✅ Ссылки работают
- ✅ .gitignore работает (нет .env, node_modules, .keystore)

## Что дальше?

1. Обновите ссылки в описании RuStore
2. Добавьте ссылку на GitHub в приложение
3. Поделитесь проектом в соцсетях
4. Ждите звездочек на GitHub! ⭐

## Полезные команды Git

```bash
# Проверить статус
git status

# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Загрузить на GitHub
git push

# Получить изменения
git pull

# Посмотреть историю
git log

# Создать новую ветку
git checkout -b feature-name

# Переключиться на main
git checkout main
```

## Помощь

Если возникли проблемы:
- [GitHub Docs](https://docs.github.com/)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
- [GitHub Desktop](https://desktop.github.com/) - графический интерфейс для Git
