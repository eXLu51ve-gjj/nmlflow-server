// API client for database operations

const API_BASE = "/api";

// Generic fetch wrapper
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Ошибка сервера" }));
    throw new Error(error.error || "Ошибка запроса");
  }

  return res.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ success: boolean; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; phone: string; password: string; inviteCode?: string }) =>
    fetchAPI<{ success: boolean; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (email: string) =>
    fetchAPI<{ success: boolean }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  heartbeat: (userId: string, email: string) =>
    fetchAPI<{ success: boolean }>("/auth/heartbeat", {
      method: "POST",
      body: JSON.stringify({ userId, email }),
    }),
};

// Columns API
export const columnsAPI = {
  create: (data: { projectId: string; name: { ru: string; en: string }; color: string; order?: number; isArchiveColumn?: boolean }) =>
    fetchAPI<any>("/columns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/columns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/columns/${id}`, { method: "DELETE" }),
  reorder: (projectId: string, columnIds: string[]) =>
    fetchAPI<any>("/columns/reorder", {
      method: "POST",
      body: JSON.stringify({ projectId, columnIds }),
    }),
};

// Users API
export const usersAPI = {
  getAll: () => fetchAPI<any[]>("/users"),
  getById: (id: string) => fetchAPI<any>(`/users/${id}`),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updateProfile: (userId: string, data: any) =>
    fetchAPI<any>("/users", {
      method: "PUT",
      body: JSON.stringify({ userId, ...data }),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
};

// Team API
export const teamAPI = {
  getAll: () => fetchAPI<any[]>("/team"),
  getById: (id: string) => fetchAPI<any>(`/team/${id}`),
  create: (data: any) =>
    fetchAPI<any>("/team", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/team/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/team/${id}`, { method: "DELETE" }),
};

// Projects API
export const projectsAPI = {
  getAll: () => fetchAPI<any[]>("/projects"),
  getById: (id: string) => fetchAPI<any>(`/projects/${id}`),
  create: (data: any) =>
    fetchAPI<any>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),
};

// Tasks API
export const tasksAPI = {
  getAll: (projectId?: string) =>
    fetchAPI<any[]>(`/tasks${projectId ? `?projectId=${projectId}` : ""}`),
  getById: (id: string) => fetchAPI<any>(`/tasks/${id}`),
  create: (data: any) =>
    fetchAPI<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/tasks/${id}`, { method: "DELETE" }),
};

// Leads API
export const leadsAPI = {
  getAll: () => fetchAPI<any[]>("/leads"),
  getById: (id: string) => fetchAPI<any>(`/leads/${id}`),
  create: (data: any) =>
    fetchAPI<any>("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI<any>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/leads/${id}`, { method: "DELETE" }),
};

// Activities API
export const activitiesAPI = {
  getAll: (limit?: number) =>
    fetchAPI<any[]>(`/activities${limit ? `?limit=${limit}` : ""}`),
  create: (data: any) =>
    fetchAPI<any>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  clear: () => fetchAPI<{ success: boolean }>("/activities", { method: "DELETE" }),
};

// Work Days API
export const workDaysAPI = {
  getAll: (memberId?: string, month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (memberId) params.set("memberId", memberId);
    if (month !== undefined) params.set("month", String(month + 1)); // API expects 1-12
    if (year !== undefined) params.set("year", String(year));
    const query = params.toString();
    return fetchAPI<any[]>(`/workdays${query ? `?${query}` : ""}`);
  },
  upsert: (data: { memberId: string; date: string; withCar?: boolean; isDouble?: boolean }) =>
    fetchAPI<any>("/workdays", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (memberId: string, date: string) =>
    fetchAPI<{ success: boolean }>(`/workdays?memberId=${memberId}&date=${date}`, {
      method: "DELETE",
    }),
};

// Settings API
export const settingsAPI = {
  get: () => fetchAPI<any>("/settings"),
  update: (data: any) =>
    fetchAPI<any>("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Invite Codes API
export const inviteCodesAPI = {
  getAll: () => fetchAPI<string[]>("/invite-codes"),
  generate: () => fetchAPI<{ code: string }>("/invite-codes", { method: "POST" }),
  delete: (code: string) =>
    fetchAPI<{ success: boolean }>(`/invite-codes?code=${code}`, { method: "DELETE" }),
};

// Comments API
export const commentsAPI = {
  getByTask: (taskId: string) => fetchAPI<any[]>(`/comments?taskId=${taskId}`),
  create: (data: { taskId: string; text: string; authorId: string }) =>
    fetchAPI<any>("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Lead Comments API
export const leadCommentsAPI = {
  getByLead: (leadId: string) => fetchAPI<any[]>(`/lead-comments?leadId=${leadId}`),
  create: (data: { leadId: string; text: string; authorId: string }) =>
    fetchAPI<any>("/lead-comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error("Failed to upload file");
    }
    
    return res.json();
  },
};

// Chat API
export const chatAPI = {
  getMessages: (userId: string, limit?: number) =>
    fetchAPI<{ messages: any[]; hasAccess: boolean }>(`/chat?userId=${userId}${limit ? `&limit=${limit}` : ""}`),
  
  sendMessage: (data: { text?: string; attachments?: string[]; authorId: string }) =>
    fetchAPI<any>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  clearChat: (userId: string) =>
    fetchAPI<{ success: boolean }>(`/chat?userId=${userId}`, { method: "DELETE" }),
  
  getAccessList: () => fetchAPI<any[]>("/chat/access"),
  
  grantAccess: (userId: string, adminId: string) =>
    fetchAPI<{ success: boolean }>("/chat/access", {
      method: "POST",
      body: JSON.stringify({ userId, adminId }),
    }),
  
  revokeAccess: (userId: string, adminId: string) =>
    fetchAPI<{ success: boolean }>(`/chat/access?userId=${userId}&adminId=${adminId}`, {
      method: "DELETE",
    }),
};

// Calendar Notes API
export const calendarNotesAPI = {
  getAll: () => fetchAPI<any[]>("/calendar-notes"),
  create: (data: { date: string; text: string; attachments?: string[] }) =>
    fetchAPI<any>("/calendar-notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { text?: string; attachments?: string[] }) =>
    fetchAPI<any>(`/calendar-notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/calendar-notes/${id}`, { method: "DELETE" }),
};

// User Settings API
export const userSettingsAPI = {
  get: (userId: string) => fetchAPI<any>(`/user-settings?userId=${userId}`),
  update: (data: { userId: string; navOrder?: string[]; revenueSources?: any[] }) =>
    fetchAPI<any>("/user-settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
