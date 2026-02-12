import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "@/lib/i18n";
import { mockLeads, mockTasks, mockTeamMembers, mockActivities } from "@/lib/mock-data";

// Color Schemes - 12 красивых схем
export const colorSchemes = [
  {
    id: "violet",
    name: { ru: "Фиолетовый", en: "Violet" },
    colors: {
      primary: "#8b5cf6",
      primaryLight: "#a78bfa",
      secondary: "#7c3aed",
      accent: "#c4b5fd",
      glass: "46, 16, 101", // violet-950 RGB
      gradientFrom: "#8b5cf6",
      gradientTo: "#7c3aed",
    }
  },
  {
    id: "teal",
    name: { ru: "Бирюзовый", en: "Teal" },
    colors: {
      primary: "#14b8a6",
      primaryLight: "#2dd4bf",
      secondary: "#0d9488",
      accent: "#5eead4",
      glass: "17, 94, 89", // teal-900 RGB
      gradientFrom: "#14b8a6",
      gradientTo: "#0d9488",
    }
  },
  {
    id: "emerald",
    name: { ru: "Изумрудный", en: "Emerald" },
    colors: {
      primary: "#10b981",
      primaryLight: "#34d399",
      secondary: "#059669",
      accent: "#6ee7b7",
      glass: "6, 78, 59", // emerald-900 RGB
      gradientFrom: "#10b981",
      gradientTo: "#059669",
    }
  },
  {
    id: "pink",
    name: { ru: "Розовый", en: "Pink" },
    colors: {
      primary: "#ec4899",
      primaryLight: "#f472b6",
      secondary: "#db2777",
      accent: "#f9a8d4",
      glass: "80, 24, 57", // pink-900 RGB
      gradientFrom: "#ec4899",
      gradientTo: "#db2777",
    }
  },
  {
    id: "amber",
    name: { ru: "Янтарный", en: "Amber" },
    colors: {
      primary: "#d97706",
      primaryLight: "#f59e0b",
      secondary: "#b45309",
      accent: "#fbbf24",
      glass: "120, 53, 15", // amber-900 RGB
      gradientFrom: "#d97706",
      gradientTo: "#b45309",
    }
  },
  {
    id: "blue",
    name: { ru: "Синий", en: "Blue" },
    colors: {
      primary: "#3b82f6",
      primaryLight: "#60a5fa",
      secondary: "#2563eb",
      accent: "#93c5fd",
      glass: "30, 58, 138", // blue-900 RGB
      gradientFrom: "#3b82f6",
      gradientTo: "#2563eb",
    }
  },
  {
    id: "indigo",
    name: { ru: "Индиго", en: "Indigo" },
    colors: {
      primary: "#6366f1",
      primaryLight: "#818cf8",
      secondary: "#4f46e5",
      accent: "#a5b4fc",
      glass: "49, 46, 129", // indigo-900 RGB
      gradientFrom: "#6366f1",
      gradientTo: "#4f46e5",
    }
  },
  {
    id: "red",
    name: { ru: "Красный", en: "Red" },
    colors: {
      primary: "#ef4444",
      primaryLight: "#f87171",
      secondary: "#dc2626",
      accent: "#fca5a5",
      glass: "127, 29, 29", // red-900 RGB
      gradientFrom: "#ef4444",
      gradientTo: "#dc2626",
    }
  },
  {
    id: "orange",
    name: { ru: "Оранжевый", en: "Orange" },
    colors: {
      primary: "#f97316",
      primaryLight: "#fb923c",
      secondary: "#ea580c",
      accent: "#fdba74",
      glass: "124, 45, 18", // orange-900 RGB
      gradientFrom: "#f97316",
      gradientTo: "#ea580c",
    }
  },
  {
    id: "cyan",
    name: { ru: "Голубой", en: "Cyan" },
    colors: {
      primary: "#06b6d4",
      primaryLight: "#22d3ee",
      secondary: "#0891b2",
      accent: "#67e8f9",
      glass: "22, 78, 99", // cyan-900 RGB
      gradientFrom: "#06b6d4",
      gradientTo: "#0891b2",
    }
  },
  {
    id: "lime",
    name: { ru: "Лайм", en: "Lime" },
    colors: {
      primary: "#84cc16",
      primaryLight: "#a3e635",
      secondary: "#65a30d",
      accent: "#bef264",
      glass: "54, 83, 20", // lime-900 RGB
      gradientFrom: "#84cc16",
      gradientTo: "#65a30d",
    }
  },
  {
    id: "slate",
    name: { ru: "Серый", en: "Slate" },
    colors: {
      primary: "#64748b",
      primaryLight: "#94a3b8",
      secondary: "#475569",
      accent: "#cbd5e1",
      glass: "30, 41, 59", // slate-800 RGB
      gradientFrom: "#64748b",
      gradientTo: "#475569",
    }
  },
] as const;

export type ColorSchemeId = typeof colorSchemes[number]["id"];

// Background presets
export const backgroundPresets = [
  {
    id: "bg1",
    name: { ru: "Фон 1", en: "Background 1" },
    url: "/backgrounds/bg-1.jpg",
    thumbnail: "/backgrounds/bg-1.jpg",
  },
  {
    id: "bg2",
    name: { ru: "Фон 2", en: "Background 2" },
    url: "/backgrounds/bg-2.jpg",
    thumbnail: "/backgrounds/bg-2.jpg",
  },
  {
    id: "bg3",
    name: { ru: "Фон 3", en: "Background 3" },
    url: "/backgrounds/bg-3.jpg",
    thumbnail: "/backgrounds/bg-3.jpg",
  },
  {
    id: "bg4",
    name: { ru: "Фон 4", en: "Background 4" },
    url: "/backgrounds/bf-4.jpg",
    thumbnail: "/backgrounds/bf-4.jpg",
  },
  {
    id: "bg5",
    name: { ru: "Фон 5", en: "Background 5" },
    url: "/backgrounds/bg-5.jpg",
    thumbnail: "/backgrounds/bg-5.jpg",
  },
  {
    id: "bg6",
    name: { ru: "Фон 6", en: "Background 6" },
    url: "/backgrounds/bg-6.jpg",
    thumbnail: "/backgrounds/bg-6.jpg",
  },
  {
    id: "bg7",
    name: { ru: "Фон 7", en: "Background 7" },
    url: "/backgrounds/bg-7.jpg",
    thumbnail: "/backgrounds/bg-7.jpg",
  },
  {
    id: "none",
    name: { ru: "Без фона", en: "Clean Dark" },
    url: "",
    thumbnail: "",
  },
] as const;

export type BackgroundPresetId = typeof backgroundPresets[number]["id"];

// Types
export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  coverImage?: string;
  assigneeId?: string;
  value: number;
  status: "leads" | "negotiation" | "proposal" | "closed";
  avatar?: string;
  createdAt: string;
  history: { date: string; action: string }[];
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string; // привязка к проекту
  title: string;
  description?: string;
  address?: string;
  phone?: string;
  coverImage?: string;
  status: string; // теперь динамический (id колонки)
  priority?: "high" | "medium" | "low";
  deadline?: string;
  assigneeId?: string; // deprecated, use assigneeIds
  assigneeIds?: string[]; // multiple assignees
  tags: string[];
  comments: Comment[];
  attachments: string[];
  order?: number; // порядок внутри колонки
  createdAt: string;
  archivedAt?: string; // дата архивации
}

// Колонка проекта
export interface ProjectColumn {
  id: string;
  name: { ru: string; en: string };
  color: string; // gradient class
  order: number;
  isArchiveColumn?: boolean; // помечена как колонка для архивации
}

// Настройки архива
export interface ArchiveSettings {
  enabled: boolean;
  sourceColumnId: string; // из какой колонки архивировать
  archiveDay: number; // день месяца для автоархивации (1-28)
}

// Архивная папка
export interface ArchiveFolder {
  id: string;
  projectId: string;
  name: string; // "1-31 Май 2025"
  startDate: string;
  endDate: string;
  taskIds: string[];
  createdAt: string;
}

// Проект
export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  columns: ProjectColumn[];
  archiveSettings: ArchiveSettings;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  isAdmin: boolean;
  lastSeen?: string;
  createdAt: string;
  // Salary settings
  dailyRate: number; // ежедневная ставка
  carBonus: number; // доплата за машину
  // Link to User account
  userId?: string;
}

// Work day record
export interface WorkDay {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  withCar: boolean;
  isDouble: boolean; // двойной день (x2)
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "lead" | "task" | "team";
  action: string;
  subject: string;
  timestamp: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  targetId?: string; // ID задачи или лида для перехода
  projectId?: string; // ID проекта
}

// Calendar Note
export interface CalendarNote {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  attachments: string[]; // base64 images
  createdAt: string;
}

// User roles
export type UserRole = "admin" | "user";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  citizenship?: string;
  role: UserRole;
  avatar: string;
}

// Registration mode type
export type RegistrationMode = "open" | "invite" | "closed";

// System Settings
export interface SystemSettings {
  registrationMode: RegistrationMode;
  inviteCodes: string[];
  requireEmailVerification: boolean;
  allowPasswordReset: boolean;
  sessionTimeout: number; // minutes, 0 = no timeout
  maxLoginAttempts: number;
  maintenanceMode: boolean;
  salaryPayday: number; // Day of month for salary period start (1-28)
}

// Revenue Settings - multiple sources support
export interface RevenueSource {
  id: string;
  type: "crm" | "project";
  projectId?: string;
  columnId?: string;
  fixedAmount: number;
  enabled: boolean;
}

export interface RevenueSettings {
  sources: RevenueSource[];
}

// Store State
interface AppState {
  // Authentication
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  registeredUsers: Array<{ email: string; password: string; name: string; phone: string; avatar: string }>;
  login: (email: string, password: string) => boolean;
  register: (data: { name: string; email: string; phone: string; password: string; inviteCode?: string }) => boolean;
  logout: () => void;
  
  // System Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // Revenue Settings
  revenueSettings: RevenueSettings;
  updateRevenueSettings: (settings: Partial<RevenueSettings>) => void;
  resetRevenueSettings: () => void;
  addInviteCode: (code: string) => void;
  removeInviteCode: (code: string) => void;
  generateInviteCode: () => string;
  
  // Current User
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  setUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<CurrentUser>) => void;
  isAdmin: () => boolean;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  navOrder: string[];
  setNavOrder: (order: string[]) => void;
  
  // Background
  backgroundPreset: BackgroundPresetId;
  customBackgroundUrl: string;
  backgroundDarkness: number;
  glassOpacity: number;
  colorScheme: ColorSchemeId;
  setBackgroundPreset: (preset: BackgroundPresetId) => void;
  setCustomBackgroundUrl: (url: string) => void;
  setBackgroundDarkness: (value: number) => void;
  setGlassOpacity: (value: number) => void;
  setColorScheme: (scheme: ColorSchemeId) => void;
  getBackgroundUrl: () => string;
  
  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  currentProjectId: string;
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  
  // Columns (for current project)
  addColumn: (column: Omit<ProjectColumn, "id" | "order">) => void;
  updateColumn: (columnId: string, updates: Partial<ProjectColumn>) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (activeId: string, overId: string) => void;
  
  // Archive
  archiveFolders: ArchiveFolder[];
  archivedTasks: Task[];
  archiveTask: (taskId: string) => void;
  archiveTasksFromColumn: (columnId: string) => void;
  archiveTasksByPeriod: (startDate: string, endDate: string, columnId?: string, projectId?: string) => void;
  getArchiveFolders: (projectId: string) => ArchiveFolder[];
  getArchivedTasksByFolder: (folderId: string) => Task[];
  updateArchiveSettings: (projectId: string, settings: Partial<ArchiveSettings>) => void;
  deleteArchiveFolder: (folderId: string) => void;
  importArchive: (data: any, projectId: string) => void;
  
  // Leads (CRM)
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "history">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  moveLead: (id: string, status: Lead["status"]) => void;
  deleteLead: (id: string) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "comments" | "attachments" | "projectId">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, text: string) => void;
  addAttachment: (taskId: string, imageBase64: string) => void;
  removeAttachment: (taskId: string, index: number) => void;
  
  // Team
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  addTeamMember: (member: Omit<TeamMember, "id" | "createdAt" | "lastSeen">) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  toggleTeamMemberAdmin: (id: string) => void;
  
  // Work Days
  workDays: WorkDay[];
  setWorkDays: (workDays: WorkDay[]) => void;
  addWorkDay: (memberId: string, date: string, withCar: boolean) => void;
  removeWorkDay: (memberId: string, date: string) => void;
  toggleWorkDayCar: (memberId: string, date: string) => void;
  toggleWorkDayDouble: (memberId: string, date: string) => void;
  getWorkDays: (memberId: string, month?: number, year?: number) => WorkDay[];
  getMemberSalary: (memberId: string, month: number, year: number) => { days: number; carDays: number; total: number };
  
  // Activities
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  maxActivities: number;
  setMaxActivities: (max: number) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
  
  // Calendar Notes
  calendarNotes: CalendarNote[];
  setCalendarNotes: (notes: CalendarNote[]) => void;
  addCalendarNote: (date: string, text: string) => void;
  updateCalendarNote: (id: string, updates: Partial<CalendarNote>) => void;
  deleteCalendarNote: (id: string) => void;
  addCalendarNoteAttachment: (id: string, imageBase64: string) => void;
  removeCalendarNoteAttachment: (id: string, index: number) => void;
  getCalendarNote: (date: string) => CalendarNote | undefined;
  getCalendarNotes: (date: string) => CalendarNote[];
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Authentication
      isAuthenticated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      registeredUsers: [
        // Super Admin
        { 
          email: "nml5222600@mail.ru", 
          password: "nmL9309706-", 
          name: "Администратор", 
          phone: "+7 (999) 123-45-67",
          avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Admin"
        }
      ],
      
      // System Settings
      systemSettings: {
        registrationMode: "open",
        inviteCodes: [],
        requireEmailVerification: false,
        allowPasswordReset: true,
        sessionTimeout: 0,
        maxLoginAttempts: 5,
        maintenanceMode: false,
        salaryPayday: 1,
      },
      updateSystemSettings: (settings) => {
        set((state) => ({
          systemSettings: { ...state.systemSettings, ...settings }
        }));
      },
      
      // Revenue Settings
      revenueSettings: {
        sources: [
          { id: "crm-default", type: "crm", fixedAmount: 0, enabled: true }
        ],
      },
      updateRevenueSettings: (settings) => {
        set((state) => ({
          revenueSettings: { ...state.revenueSettings, ...settings }
        }));
      },
      resetRevenueSettings: () => {
        set({
          revenueSettings: {
            sources: [
              { id: "crm-default", type: "crm", fixedAmount: 0, enabled: true }
            ],
          }
        });
      },
      
      addInviteCode: (code) => {
        set((state) => ({
          systemSettings: {
            ...state.systemSettings,
            inviteCodes: [...state.systemSettings.inviteCodes, code]
          }
        }));
      },
      removeInviteCode: (code) => {
        set((state) => ({
          systemSettings: {
            ...state.systemSettings,
            inviteCodes: state.systemSettings.inviteCodes.filter(c => c !== code)
          }
        }));
      },
      generateInviteCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        get().addInviteCode(code);
        return code;
      },
      
      login: (email, password) => {
        const users = get().registeredUsers;
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          set({
            isAuthenticated: true,
            currentUser: {
              id: "current-user",
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.email === "nml5222600@mail.ru" ? "admin" : "user",
              avatar: user.avatar,
            }
          });
          return true;
        }
        return false;
      },
      register: (data) => {
        const { systemSettings } = get();
        
        // Check registration mode
        if (systemSettings.registrationMode === "closed") {
          return false;
        }
        
        if (systemSettings.registrationMode === "invite") {
          if (!data.inviteCode || !systemSettings.inviteCodes.includes(data.inviteCode)) {
            return false;
          }
          // Remove used invite code
          get().removeInviteCode(data.inviteCode);
        }
        
        const users = get().registeredUsers;
        if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
          return false; // Email already exists
        }
        const newUser = {
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        };
        set((state) => ({
          registeredUsers: [...state.registeredUsers, newUser],
          isAuthenticated: true,
          currentUser: {
            id: "current-user",
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: "user",
            avatar: newUser.avatar,
          }
        }));
        return true;
      },
      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: {
            id: "current-user",
            name: "",
            email: "",
            phone: "",
            role: "user",
            avatar: "",
          }
        });
      },
      
      // Current User
      currentUser: {
        id: "current-user",
        name: "",
        email: "",
        phone: "",
        role: "user",
        avatar: "",
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserRole: (role) => set((state) => ({
        currentUser: {
          ...state.currentUser,
          role,
          name: role === "admin" ? "Администратор" : "Пользователь",
        }
      })),
      updateUserProfile: (updates) => set((state) => ({
        currentUser: {
          ...state.currentUser,
          ...updates,
        }
      })),
      isAdmin: () => get().currentUser.role === "admin",
      
      // Language
      language: "ru",
      setLanguage: (lang) => set({ language: lang }),
      
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      navOrder: ["dashboard", "notifications", "crm", "tasks", "salary", "admin", "settings"],
      setNavOrder: (order) => set({ navOrder: order }),
      
      // Background
      backgroundPreset: "none",
      customBackgroundUrl: "",
      backgroundDarkness: 50,
      glassOpacity: 40,
      colorScheme: "violet",
      setBackgroundPreset: (preset) => set({ backgroundPreset: preset, customBackgroundUrl: "" }),
      setCustomBackgroundUrl: (url) => set({ customBackgroundUrl: url, backgroundPreset: "none" }),
      setBackgroundDarkness: (value) => set({ backgroundDarkness: value }),
      setGlassOpacity: (value) => set({ glassOpacity: value }),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      getBackgroundUrl: () => {
        const state = get();
        if (state.customBackgroundUrl) return state.customBackgroundUrl;
        const preset = backgroundPresets.find((p) => p.id === state.backgroundPreset);
        return preset?.url || "";
      },
      
      // Projects
      projects: [{
        id: "default",
        name: "Основной проект",
        description: "Проект по умолчанию",
        columns: [
          { id: "todo", name: { ru: "К выполнению", en: "To Do" }, color: "from-slate-500 to-slate-600", order: 0 },
          { id: "inProgress", name: { ru: "В работе", en: "In Progress" }, color: "from-blue-500 to-indigo-500", order: 1 },
          { id: "review", name: { ru: "На проверке", en: "Review" }, color: "from-amber-500 to-orange-500", order: 2 },
          { id: "done", name: { ru: "Готово", en: "Done" }, color: "from-emerald-500 to-green-500", order: 3, isArchiveColumn: true },
        ],
        archiveSettings: {
          enabled: false,
          sourceColumnId: "done",
          archiveDay: 1,
        },
        createdAt: new Date().toISOString(),
      }],
      setProjects: (projects) => set({ projects }),
      currentProjectId: "default",
      
      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        get().addActivity({ type: "task", action: "created", subject: `Проект: ${newProject.name}`, userId: get().currentUser.id });
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
        }));
      },
      deleteProject: (id) => {
        if (id === "default") return; // нельзя удалить дефолтный
        const project = get().projects.find((p) => p.id === id);
        if (project) {
          get().addActivity({ type: "task", action: "deleted", subject: `Проект: ${project.name}`, userId: get().currentUser.id });
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? "default" : state.currentProjectId,
        }));
      },
      setCurrentProject: (id) => set({ currentProjectId: id }),
      
      // Columns
      addColumn: (column) => {
        const projectId = get().currentProjectId;
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;
        
        const newColumn: ProjectColumn = {
          ...column,
          id: generateId(),
          order: project.columns.length,
        };
        set((state) => ({
          projects: state.projects.map((p) => 
            p.id === projectId 
              ? { ...p, columns: [...p.columns, newColumn] }
              : p
          ),
        }));
      },
      updateColumn: (columnId, updates) => {
        const projectId = get().currentProjectId;
        set((state) => ({
          projects: state.projects.map((p) => 
            p.id === projectId 
              ? { ...p, columns: p.columns.map((c) => c.id === columnId ? { ...c, ...updates } : c) }
              : p
          ),
        }));
      },
      deleteColumn: (columnId) => {
        const projectId = get().currentProjectId;
        // Перемещаем задачи из удаляемой колонки в первую колонку
        const project = get().projects.find((p) => p.id === projectId);
        if (!project || project.columns.length <= 1) return;
        
        const firstColumnId = project.columns.find((c) => c.id !== columnId)?.id;
        if (!firstColumnId) return;
        
        set((state) => ({
          projects: state.projects.map((p) => 
            p.id === projectId 
              ? { ...p, columns: p.columns.filter((c) => c.id !== columnId) }
              : p
          ),
          tasks: state.tasks.map((t) => 
            t.status === columnId ? { ...t, status: firstColumnId } : t
          ),
        }));
      },
      reorderColumns: (activeId, overId) => {
        const projectId = get().currentProjectId;
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (!project) return state;
          
          const oldIndex = project.columns.findIndex((c) => c.id === activeId);
          const newIndex = project.columns.findIndex((c) => c.id === overId);
          if (oldIndex === -1 || newIndex === -1) return state;
          
          const newColumns = [...project.columns];
          const [removed] = newColumns.splice(oldIndex, 1);
          newColumns.splice(newIndex, 0, removed);
          
          // Обновляем order
          const reorderedColumns = newColumns.map((c, i) => ({ ...c, order: i }));
          
          return {
            projects: state.projects.map((p) => 
              p.id === projectId ? { ...p, columns: reorderedColumns } : p
            ),
          };
        });
      },
      
      // Archive
      archiveFolders: [],
      archivedTasks: [],
      archiveTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        
        const now = new Date();
        const monthNames = { ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"] };
        const folderName = `1-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()} ${monthNames.ru[now.getMonth()]} ${now.getFullYear()}`;
        
        // Найти или создать папку
        let folder = get().archiveFolders.find((f) => 
          f.projectId === task.projectId && f.name === folderName
        );
        
        if (!folder) {
          folder = {
            id: generateId(),
            projectId: task.projectId,
            name: folderName,
            startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
            taskIds: [],
            createdAt: now.toISOString(),
          };
          set((state) => ({ archiveFolders: [...state.archiveFolders, folder!] }));
        }
        
        const archivedTask = { ...task, archivedAt: now.toISOString() };
        
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          archivedTasks: [...state.archivedTasks, archivedTask],
          archiveFolders: state.archiveFolders.map((f) => 
            f.id === folder!.id ? { ...f, taskIds: [...f.taskIds, taskId] } : f
          ),
        }));
        
        get().addActivity({ type: "task", action: "archived", subject: task.title, userId: get().currentUser.id });
      },
      archiveTasksFromColumn: (columnId) => {
        const projectId = get().currentProjectId;
        const tasksToArchive = get().tasks.filter((t) => t.projectId === projectId && t.status === columnId);
        tasksToArchive.forEach((task) => get().archiveTask(task.id));
      },
      archiveTasksByPeriod: (startDate, endDate, columnId, projectId) => {
        const targetProjectId = projectId || get().currentProjectId;
        const project = get().projects.find((p) => p.id === targetProjectId);
        if (!project) return;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        // Фильтруем задачи по периоду и опционально по колонке
        const tasksToArchive = get().tasks.filter((t) => {
          if (t.projectId !== targetProjectId) return false;
          if (columnId && t.status !== columnId) return false;
          const taskDate = new Date(t.createdAt);
          return taskDate >= start && taskDate <= end;
        });
        
        if (tasksToArchive.length === 0) return;
        
        // Создаём название папки
        const monthNames = { ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"] };
        const startDay = start.getDate();
        const endDay = end.getDate();
        const folderName = `${startDay}-${endDay} ${monthNames.ru[start.getMonth()]} ${start.getFullYear()}`;
        
        // Создаём папку
        const folder: ArchiveFolder = {
          id: generateId(),
          projectId: targetProjectId,
          name: folderName,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          taskIds: tasksToArchive.map((t) => t.id),
          createdAt: new Date().toISOString(),
        };
        
        const now = new Date().toISOString();
        const archivedTasks = tasksToArchive.map((t) => ({ ...t, archivedAt: now }));
        
        set((state) => ({
          archiveFolders: [...state.archiveFolders, folder],
          archivedTasks: [...state.archivedTasks, ...archivedTasks],
          tasks: state.tasks.filter((t) => !tasksToArchive.find((at) => at.id === t.id)),
        }));
        
        get().addActivity({ type: "task", action: "archived", subject: `${tasksToArchive.length} задач в "${folderName}"`, userId: get().currentUser.id });
      },
      getArchiveFolders: (projectId) => get().archiveFolders.filter((f) => f.projectId === projectId),
      getArchivedTasksByFolder: (folderId) => {
        const folder = get().archiveFolders.find((f) => f.id === folderId);
        if (!folder) return [];
        return get().archivedTasks.filter((t) => folder.taskIds.includes(t.id));
      },
      updateArchiveSettings: (projectId, settings) => {
        set((state) => ({
          projects: state.projects.map((p) => 
            p.id === projectId 
              ? { ...p, archiveSettings: { ...p.archiveSettings, ...settings } }
              : p
          ),
        }));
      },
      deleteArchiveFolder: (folderId) => {
        const folder = get().archiveFolders.find((f) => f.id === folderId);
        if (!folder) return;
        
        set((state) => ({
          archiveFolders: state.archiveFolders.filter((f) => f.id !== folderId),
          archivedTasks: state.archivedTasks.filter((t) => !folder.taskIds.includes(t.id)),
        }));
        
        get().addActivity({ type: "task", action: "deleted", subject: `Архив: ${folder.name}`, userId: get().currentUser.id });
      },
      importArchive: (data, projectId) => {
        if (!data.folder || !data.tasks) return;
        
        // Создаём новую папку архива
        const newFolder: ArchiveFolder = {
          id: generateId(),
          projectId,
          name: data.folder.name,
          startDate: data.folder.startDate,
          endDate: data.folder.endDate,
          taskIds: [],
          createdAt: new Date().toISOString(),
        };
        
        // Импортируем задачи с новыми ID
        const importedTasks: Task[] = data.tasks.map((task: any) => {
          const newId = generateId();
          newFolder.taskIds.push(newId);
          return {
            id: newId,
            projectId,
            title: task.title,
            description: task.description,
            address: task.address,
            phone: task.phone,
            coverImage: task.coverImage,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            assigneeId: task.assigneeId,
            tags: task.tags || [],
            comments: task.comments || [],
            attachments: task.attachments || [],
            createdAt: task.createdAt,
            archivedAt: task.archivedAt || new Date().toISOString(),
          };
        });
        
        set((state) => ({
          archiveFolders: [...state.archiveFolders, newFolder],
          archivedTasks: [...state.archivedTasks, ...importedTasks],
        }));
        
        get().addActivity({ type: "task", action: "created", subject: `Импортирован архив: ${newFolder.name}`, userId: get().currentUser.id });
      },
      
      // Leads
      leads: [],
      setLeads: (leads) => set({ leads }),
      addLead: (lead) => {
        const newLead: Lead = {
          ...lead,
          id: generateId(),
          createdAt: new Date().toISOString(),
          history: [{ date: new Date().toISOString(), action: "Лид создан" }],
        };
        set((state) => ({ leads: [...state.leads, newLead] }));
        get().addActivity({ type: "lead", action: "created", subject: lead.name, userId: get().currentUser.id, targetId: newLead.id });
      },
      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? {
                  ...lead,
                  ...updates,
                  history: [
                    ...lead.history,
                    { date: new Date().toISOString(), action: "Лид обновлён" },
                  ],
                }
              : lead
          ),
        }));
      },
      moveLead: (id, status) => {
        const lead = get().leads.find((l) => l.id === id);
        if (lead) {
          set((state) => ({
            leads: state.leads.map((l) =>
              l.id === id
                ? {
                    ...l,
                    status,
                    history: [
                      ...l.history,
                      { date: new Date().toISOString(), action: `Перемещён в "${status}"` },
                    ],
                  }
                : l
            ),
          }));
          get().addActivity({ type: "lead", action: "moved", subject: lead.name, userId: get().currentUser.id, targetId: id });
        }
      },
      deleteLead: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        if (lead) {
          get().addActivity({ type: "lead", action: "deleted", subject: lead.name, userId: get().currentUser.id });
        }
        set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id) }));
      },
      
      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => {
        const projectId = get().currentProjectId;
        const newTask: Task = {
          ...task,
          id: generateId(),
          projectId,
          comments: [],
          attachments: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        get().addActivity({ type: "task", action: "created", subject: task.title, userId: get().currentUser.id, targetId: newTask.id, projectId });
      },
      updateTask: (id, updates) => {
        const task = get().tasks.find((t) => t.id === id);
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }));
        if (task) {
          get().addActivity({ type: "task", action: "updated", subject: task.title, userId: get().currentUser.id, targetId: id, projectId: task.projectId });
        }
      },
      moveTask: (id, status) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
          }));
          get().addActivity({ type: "task", action: "moved", subject: task.title, userId: get().currentUser.id, targetId: id, projectId: task.projectId });
        }
      },
      reorderTasks: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
          const newIndex = state.tasks.findIndex((t) => t.id === overId);
          
          if (oldIndex === -1 || newIndex === -1) return state;
          
          const activeTask = state.tasks[oldIndex];
          const overTask = state.tasks[newIndex];
          
          // Обновляем статус если перетаскиваем в другую колонку
          const updatedActiveTask = { ...activeTask, status: overTask.status };
          
          // Создаём новый массив с перемещённой задачей
          const newTasks = [...state.tasks];
          newTasks.splice(oldIndex, 1);
          newTasks.splice(newIndex, 0, updatedActiveTask);
          
          return { tasks: newTasks };
        });
      },
      deleteTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          get().addActivity({ type: "task", action: "deleted", subject: task.title, userId: get().currentUser.id, projectId: task.projectId });
        }
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
      },
      addComment: (taskId: string, text: string) => {
        const task = get().tasks.find((t) => t.id === taskId);
        const comment: Comment = {
          id: generateId(),
          text,
          authorId: "1",
          authorName: "Вы",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, comments: [...(task.comments || []), comment] }
              : task
          ),
        }));
        if (task) {
          get().addActivity({ type: "task", action: "commented", subject: `${task.title}: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`, userId: get().currentUser.id, targetId: taskId, projectId: task.projectId });
        }
      },
      addAttachment: (taskId: string, imageBase64: string) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, attachments: [...(task.attachments || []), imageBase64] }
              : task
          ),
        }));
        if (task) {
          get().addActivity({ type: "task", action: "updated", subject: `${task.title}: добавлено вложение`, userId: get().currentUser.id, targetId: taskId, projectId: task.projectId });
        }
      },
      removeAttachment: (taskId: string, index: number) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, attachments: (task.attachments || []).filter((_, i) => i !== index) }
              : task
          ),
        }));
        if (task) {
          get().addActivity({ type: "task", action: "updated", subject: `${task.title}: удалено вложение`, userId: get().currentUser.id, targetId: taskId, projectId: task.projectId });
        }
      },
      
      // Team
      teamMembers: [],
      setTeamMembers: (members) => set({ teamMembers: members }),
      addTeamMember: (member) => {
        const newMember: TeamMember = {
          ...member,
          id: generateId(),
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        };
        set((state) => ({ teamMembers: [...state.teamMembers, newMember] }));
        get().addActivity({ type: "team", action: "created", subject: `Добавлен: ${newMember.name}`, userId: get().currentUser.id });
      },
      updateTeamMember: (id, updates) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((m) => m.id === id ? { ...m, ...updates } : m),
        }));
      },
      deleteTeamMember: (id) => {
        const member = get().teamMembers.find((m) => m.id === id);
        if (member) {
          get().addActivity({ type: "team", action: "deleted", subject: `Удалён: ${member.name}`, userId: get().currentUser.id });
        }
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        }));
      },
      toggleTeamMemberAdmin: (id) => {
        const member = get().teamMembers.find((m) => m.id === id);
        if (member) {
          set((state) => ({
            teamMembers: state.teamMembers.map((m) => 
              m.id === id ? { ...m, isAdmin: !m.isAdmin } : m
            ),
          }));
          get().addActivity({ 
            type: "team", 
            action: "updated", 
            subject: `${member.name}: ${member.isAdmin ? "снят админ" : "назначен админом"}`, 
            userId: get().currentUser.id 
          });
        }
      },
      
      // Work Days
      workDays: [],
      setWorkDays: (workDays) => set({ workDays }),
      addWorkDay: (memberId, date, withCar) => {
        const existing = get().workDays.find(w => w.memberId === memberId && w.date === date);
        if (existing) return;
        
        const newWorkDay: WorkDay = {
          id: generateId(),
          memberId,
          date,
          withCar,
          isDouble: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ workDays: [...state.workDays, newWorkDay] }));
      },
      removeWorkDay: (memberId, date) => {
        set((state) => ({
          workDays: state.workDays.filter(w => !(w.memberId === memberId && w.date === date)),
        }));
      },
      toggleWorkDayCar: (memberId, date) => {
        set((state) => ({
          workDays: state.workDays.map(w => 
            w.memberId === memberId && w.date === date ? { ...w, withCar: !w.withCar } : w
          ),
        }));
      },
      toggleWorkDayDouble: (memberId, date) => {
        set((state) => ({
          workDays: state.workDays.map(w => 
            w.memberId === memberId && w.date === date ? { ...w, isDouble: !w.isDouble } : w
          ),
        }));
      },
      getWorkDays: (memberId, month, year) => {
        return get().workDays.filter(w => {
          if (w.memberId !== memberId) return false;
          if (month !== undefined && year !== undefined) {
            const d = new Date(w.date);
            return d.getMonth() === month && d.getFullYear() === year;
          }
          return true;
        });
      },
      getMemberSalary: (memberId, month, year) => {
        const member = get().teamMembers.find(m => m.id === memberId);
        if (!member) return { days: 0, carDays: 0, doubleDays: 0, total: 0 };
        
        const days = get().workDays.filter(w => {
          if (w.memberId !== memberId) return false;
          const d = new Date(w.date);
          return d.getMonth() === month && d.getFullYear() === year;
        });
        
        const carDays = days.filter(d => d.withCar).length;
        const doubleDays = days.filter(d => d.isDouble).length;
        // Двойные дни считаются как 2 дня
        const effectiveDays = days.length + doubleDays;
        const total = effectiveDays * member.dailyRate + carDays * member.carBonus;
        
        return { days: days.length, carDays, doubleDays, total };
      },
      
      // Activities
      activities: [],
      setActivities: (activities) => set({ activities }),
      maxActivities: 1000,
      setMaxActivities: (max) => {
        set({ maxActivities: max });
        // Обрезаем существующие записи если нужно
        const current = get().activities;
        if (current.length > max) {
          set({ activities: current.slice(0, max) });
        }
      },
      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        const max = get().maxActivities;
        set((state) => ({ activities: [newActivity, ...state.activities].slice(0, max) }));
      },
      clearActivities: () => {
        set({ activities: [] });
      },
      
      // Calendar Notes
      calendarNotes: [],
      setCalendarNotes: (notes) => set({ calendarNotes: notes }),
      addCalendarNote: (date, text) => {
        const newNote: CalendarNote = {
          id: generateId(),
          date,
          text,
          attachments: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ calendarNotes: [...state.calendarNotes, newNote] }));
        return newNote.id;
      },
      updateCalendarNote: (id, updates) => {
        set((state) => ({
          calendarNotes: state.calendarNotes.map(n => n.id === id ? { ...n, ...updates } : n),
        }));
      },
      deleteCalendarNote: (id) => {
        set((state) => ({
          calendarNotes: state.calendarNotes.filter(n => n.id !== id),
        }));
      },
      addCalendarNoteAttachment: (id, imageBase64) => {
        set((state) => ({
          calendarNotes: state.calendarNotes.map(n => 
            n.id === id ? { ...n, attachments: [...n.attachments, imageBase64] } : n
          ),
        }));
      },
      removeCalendarNoteAttachment: (id, index) => {
        set((state) => ({
          calendarNotes: state.calendarNotes.map(n => 
            n.id === id ? { ...n, attachments: n.attachments.filter((_, i) => i !== index) } : n
          ),
        }));
      },
      getCalendarNote: (date) => get().calendarNotes.find(n => n.date === date),
      getCalendarNotes: (date) => get().calendarNotes.filter(n => n.date === date),
    }),
    {
      name: "nexaflow-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
        systemSettings: state.systemSettings,
        revenueSettings: state.revenueSettings,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        navOrder: state.navOrder,
        backgroundPreset: state.backgroundPreset,
        backgroundDarkness: state.backgroundDarkness,
        glassOpacity: state.glassOpacity,
        colorScheme: state.colorScheme,
        customBackgroundUrl: state.customBackgroundUrl,
        currentUser: state.currentUser,
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        archiveFolders: state.archiveFolders,
        archivedTasks: state.archivedTasks,
        leads: state.leads,
        tasks: state.tasks,
        activities: state.activities,
        maxActivities: state.maxActivities,
        calendarNotes: state.calendarNotes,
        teamMembers: state.teamMembers,
        workDays: state.workDays,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AppState>),
      }),
    }
  )
);
