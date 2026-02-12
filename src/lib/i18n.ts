// Internationalization - Russian & English

export type Language = "ru" | "en";

export const translations = {
  ru: {
    // Navigation
    "nav.dashboard": "Дашборд",
    "nav.notifications": "Уведомления и логи",
    "nav.crm": "CRM",
    "nav.tasks": "Проекты",
    "nav.team": "Команда",
    "nav.settings": "Настройки",
    "nav.salary": "Моя зарплата",
    
    // Dashboard
    "dashboard.title": "Дашборд",
    "dashboard.welcome": "Добро пожаловать",
    "dashboard.totalLeads": "Всего лидов",
    "dashboard.activeLeads": "Активные лиды",
    "dashboard.activeTasks": "Активные задачи",
    "dashboard.completedTasks": "Завершённые задачи",
    "dashboard.revenueForecast": "Прогноз выручки",
    "dashboard.teamActivity": "Активность команды",
    "dashboard.recentActivity": "Последняя активность",
    "dashboard.quickActions": "Быстрые действия",
    "dashboard.newLead": "Новый лид",
    "dashboard.newTask": "Новая задача",
    
    // CRM
    "crm.title": "CRM Pipeline",
    "crm.leads": "Лиды",
    "crm.negotiation": "Переговоры",
    "crm.proposal": "Предложение",
    "crm.closed": "Закрыто",
    "crm.addLead": "Добавить лид",
    "crm.clientDetails": "Детали клиента",
    "crm.history": "История",
    "crm.value": "Сумма сделки",
    "crm.contact": "Контакт",
    "crm.company": "Компания",
    
    // Tasks
    "tasks.title": "Задачи",
    "tasks.todo": "К выполнению",
    "tasks.inProgress": "В работе",
    "tasks.review": "На проверке",
    "tasks.done": "Готово",
    "tasks.addTask": "Добавить задачу",
    "tasks.deadline": "Дедлайн",
    "tasks.assignee": "Исполнитель",
    "tasks.priority": "Приоритет",
    "tasks.high": "Высокий",
    "tasks.medium": "Средний",
    "tasks.low": "Низкий",
    "tasks.tags": "Теги",
    
    // Team
    "team.title": "Команда",
    "team.members": "Участники",
    "team.online": "Онлайн",
    "team.offline": "Оффлайн",
    "team.role": "Роль",
    
    // Settings
    "settings.title": "Настройки",
    "settings.profile": "Профиль",
    "settings.appearance": "Внешний вид",
    "settings.background": "Фон",
    "settings.backgroundPresets": "Пресеты",
    "settings.customUrl": "Свой URL",
    "settings.customUrlPlaceholder": "Вставьте ссылку на изображение",
    "settings.theme": "Тема",
    "settings.language": "Язык",
    "settings.darkMode": "Тёмная тема",
    "settings.lightMode": "Светлая тема",
    "settings.save": "Сохранить",
    
    // Admin
    "admin.title": "Админ-панель",
    "admin.archive": "Архивация",
    "admin.archiveSettings": "Настройки архивации",
    "admin.archiveColumn": "Колонка для архивации",
    "admin.autoArchive": "Автоархивация",
    "admin.autoArchiveDays": "Архивировать через (дней)",
    "admin.archivePeriod": "Период архивации",
    "admin.monthly": "Ежемесячно",
    "admin.weekly": "Еженедельно",
    "admin.custom": "Вручную",
    "admin.archiveNow": "Архивировать сейчас",
    "admin.downloadArchive": "Скачать архив",
    "admin.archiveFolders": "Архивные папки",
    "admin.noArchives": "Нет архивов",
    "admin.tasksCount": "задач",
    "admin.selectPeriod": "Выберите период",
    "admin.from": "С",
    "admin.to": "По",
    "admin.createArchive": "Создать архив",
    "admin.archiveEnabled": "Архивация включена",
    "admin.archiveDisabled": "Архивация выключена",
    
    // Common
    "common.search": "Поиск...",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.close": "Закрыть",
    "common.loading": "Загрузка...",
    "common.noData": "Нет данных",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.notifications": "Notifications & Logs",
    "nav.crm": "CRM",
    "nav.tasks": "Projects",
    "nav.team": "Team",
    "nav.settings": "Settings",
    "nav.salary": "My Salary",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.totalLeads": "Total Leads",
    "dashboard.activeLeads": "Active Leads",
    "dashboard.activeTasks": "Active Tasks",
    "dashboard.completedTasks": "Completed Tasks",
    "dashboard.revenueForecast": "Revenue Forecast",
    "dashboard.teamActivity": "Team Activity",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.newLead": "New Lead",
    "dashboard.newTask": "New Task",
    
    // CRM
    "crm.title": "CRM Pipeline",
    "crm.leads": "Leads",
    "crm.negotiation": "Negotiation",
    "crm.proposal": "Proposal",
    "crm.closed": "Closed",
    "crm.addLead": "Add Lead",
    "crm.clientDetails": "Client Details",
    "crm.history": "History",
    "crm.value": "Deal Value",
    "crm.contact": "Contact",
    "crm.company": "Company",
    
    // Tasks
    "tasks.title": "Tasks",
    "tasks.todo": "To Do",
    "tasks.inProgress": "In Progress",
    "tasks.review": "Review",
    "tasks.done": "Done",
    "tasks.addTask": "Add Task",
    "tasks.deadline": "Deadline",
    "tasks.assignee": "Assignee",
    "tasks.priority": "Priority",
    "tasks.high": "High",
    "tasks.medium": "Medium",
    "tasks.low": "Low",
    "tasks.tags": "Tags",
    
    // Team
    "team.title": "Team",
    "team.members": "Members",
    "team.online": "Online",
    "team.offline": "Offline",
    "team.role": "Role",
    
    // Settings
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.appearance": "Appearance",
    "settings.background": "Background",
    "settings.backgroundPresets": "Presets",
    "settings.customUrl": "Custom URL",
    "settings.customUrlPlaceholder": "Paste image URL",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.darkMode": "Dark Mode",
    "settings.lightMode": "Light Mode",
    "settings.save": "Save",
    
    // Admin
    "admin.title": "Admin Panel",
    "admin.archive": "Archive",
    "admin.archiveSettings": "Archive Settings",
    "admin.archiveColumn": "Archive Column",
    "admin.autoArchive": "Auto Archive",
    "admin.autoArchiveDays": "Archive after (days)",
    "admin.archivePeriod": "Archive Period",
    "admin.monthly": "Monthly",
    "admin.weekly": "Weekly",
    "admin.custom": "Manual",
    "admin.archiveNow": "Archive Now",
    "admin.downloadArchive": "Download Archive",
    "admin.archiveFolders": "Archive Folders",
    "admin.noArchives": "No archives",
    "admin.tasksCount": "tasks",
    "admin.selectPeriod": "Select Period",
    "admin.from": "From",
    "admin.to": "To",
    "admin.createArchive": "Create Archive",
    "admin.archiveEnabled": "Archive enabled",
    "admin.archiveDisabled": "Archive disabled",
    
    // Common
    "common.search": "Search...",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.noData": "No data",
  },
} as const;

export type TranslationKey = keyof typeof translations.ru;

export function t(key: TranslationKey, lang: Language = "ru"): string {
  return translations[lang][key] || key;
}
