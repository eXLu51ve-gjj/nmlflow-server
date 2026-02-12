"use client";

import { useStore } from "@/store";
import {
  teamAPI,
  projectsAPI,
  tasksAPI,
  leadsAPI,
  activitiesAPI,
  workDaysAPI,
  settingsAPI,
  inviteCodesAPI,
  commentsAPI,
  leadCommentsAPI,
  columnsAPI,
  authAPI,
  calendarNotesAPI,
  userSettingsAPI,
} from "./api";

// Helper to get store outside of React
const getStore = () => useStore.getState();

// ============ TEAM ACTIONS ============

export async function createTeamMember(data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
  isAdmin?: boolean;
  dailyRate?: number;
  carBonus?: number;
}) {
  try {
    const member = await teamAPI.create(data);
    const store = getStore();
    store.setTeamMembers([...store.teamMembers, {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      avatar: member.avatar,
      isOnline: member.isOnline,
      isAdmin: member.isAdmin,
      dailyRate: member.dailyRate || 0,
      carBonus: member.carBonus || 0,
      lastSeen: member.lastSeen,
      createdAt: member.createdAt,
    }]);
    return member;
  } catch (error) {
    console.error("Failed to create team member:", error);
    throw error;
  }
}

export async function updateTeamMember(id: string, updates: any) {
  try {
    const member = await teamAPI.update(id, updates);
    const store = getStore();
    store.setTeamMembers(store.teamMembers.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
    return member;
  } catch (error) {
    console.error("Failed to update team member:", error);
    throw error;
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await teamAPI.delete(id);
    const store = getStore();
    store.setTeamMembers(store.teamMembers.filter(m => m.id !== id));
  } catch (error) {
    console.error("Failed to delete team member:", error);
    throw error;
  }
}

// ============ LEAD ACTIONS ============

export async function createLead(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  coverImage?: string;
  value?: number;
  status?: string;
  avatar?: string;
  assigneeId?: string;
}) {
  try {
    const lead = await leadsAPI.create(data);
    const store = getStore();
    store.setLeads([...store.leads, lead]);
    
    // Create activity
    await createActivity({
      type: "lead",
      action: "created",
      subject: lead.name,
      userId: store.currentUser.id,
      targetId: lead.id,
    });
    
    return lead;
  } catch (error) {
    console.error("Failed to create lead:", error);
    throw error;
  }
}

export async function updateLead(id: string, updates: any) {
  try {
    const lead = await leadsAPI.update(id, updates);
    const store = getStore();
    store.setLeads(store.leads.map(l => l.id === id ? lead : l));
    return lead;
  } catch (error) {
    console.error("Failed to update lead:", error);
    throw error;
  }
}

export async function deleteLead(id: string) {
  try {
    const store = getStore();
    const lead = store.leads.find(l => l.id === id);
    
    await leadsAPI.delete(id);
    store.setLeads(store.leads.filter(l => l.id !== id));
    
    // Create activity
    if (lead) {
      await createActivity({
        type: "lead",
        action: "deleted",
        subject: lead.name,
        userId: store.currentUser.id,
      });
    }
  } catch (error) {
    console.error("Failed to delete lead:", error);
    throw error;
  }
}

export async function moveLead(id: string, status: string) {
  const store = getStore();
  const lead = store.leads.find(l => l.id === id);
  
  const result = await updateLead(id, { status });
  
  // Create activity
  if (lead) {
    await createActivity({
      type: "lead",
      action: "moved",
      subject: lead.name,
      userId: store.currentUser.id,
      targetId: id,
    });
  }
  
  return result;
}

// ============ TASK ACTIONS ============

export async function createTask(data: {
  title: string;
  description?: string;
  address?: string;
  phone?: string;
  coverImage?: string;
  status: string;
  priority?: string;
  deadline?: string;
  tags?: string[];
  assigneeIds?: string[];
  projectId: string;
}) {
  try {
    const task = await tasksAPI.create(data);
    const store = getStore();
    store.setTasks([...store.tasks, task]);
    
    // Create activity
    await createActivity({
      type: "task",
      action: "created",
      subject: task.title,
      userId: store.currentUser.id,
      targetId: task.id,
      projectId: data.projectId,
    });
    
    return task;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
}

export async function updateTask(id: string, updates: any) {
  try {
    const task = await tasksAPI.update(id, updates);
    const store = getStore();
    const oldTask = store.tasks.find(t => t.id === id);
    store.setTasks(store.tasks.map(t => t.id === id ? task : t));
    
    // Create activity
    if (oldTask) {
      await createActivity({
        type: "task",
        action: "updated",
        subject: task.title,
        userId: store.currentUser.id,
        targetId: id,
        projectId: oldTask.projectId,
      });
    }
    
    return task;
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
}

export async function deleteTask(id: string) {
  try {
    const store = getStore();
    const task = store.tasks.find(t => t.id === id);
    
    await tasksAPI.delete(id);
    store.setTasks(store.tasks.filter(t => t.id !== id));
    
    // Create activity
    if (task) {
      await createActivity({
        type: "task",
        action: "deleted",
        subject: task.title,
        userId: store.currentUser.id,
        projectId: task.projectId,
      });
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }
}

export async function moveTask(id: string, status: string) {
  const store = getStore();
  const task = store.tasks.find(t => t.id === id);
  
  const result = await updateTask(id, { status });
  
  // Create move activity
  if (task) {
    await createActivity({
      type: "task",
      action: "moved",
      subject: task.title,
      userId: store.currentUser.id,
      targetId: id,
      projectId: task.projectId,
    });
  }
  
  return result;
}

export async function reorderTasks(taskIds: string[], columnId?: string) {
  try {
    const response = await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskIds, columnId }),
    });
    
    if (!response.ok) throw new Error("Failed to reorder tasks");
    
    // Update local store order
    const store = getStore();
    const updatedTasks = store.tasks.map(task => {
      const orderIndex = taskIds.indexOf(task.id);
      if (orderIndex !== -1) {
        return { 
          ...task, 
          order: orderIndex,
          ...(columnId ? { status: columnId } : {})
        };
      }
      return task;
    });
    store.setTasks(updatedTasks);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder tasks:", error);
    throw error;
  }
}

// ============ PROJECT ACTIONS ============

export async function createProject(data: {
  name: string;
  description?: string;
  icon?: string;
  columns?: any[];
  archiveSettings?: any;
}) {
  try {
    const project = await projectsAPI.create(data);
    const store = getStore();
    store.setProjects([...store.projects, project]);
    return project;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error;
  }
}

export async function updateProject(id: string, updates: any) {
  try {
    const project = await projectsAPI.update(id, updates);
    const store = getStore();
    store.setProjects(store.projects.map(p => p.id === id ? project : p));
    return project;
  } catch (error) {
    console.error("Failed to update project:", error);
    throw error;
  }
}

export async function deleteProject(id: string) {
  try {
    await projectsAPI.delete(id);
    const store = getStore();
    store.setProjects(store.projects.filter(p => p.id !== id));
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
}

// ============ WORK DAY ACTIONS ============

export async function addWorkDay(memberId: string, date: string, withCar: boolean = false) {
  try {
    const workDay = await workDaysAPI.upsert({ memberId, date, withCar });
    const store = getStore();
    const existing = store.workDays.find(w => w.memberId === memberId && w.date === date);
    if (existing) {
      store.setWorkDays(store.workDays.map(w => 
        w.memberId === memberId && w.date === date ? workDay : w
      ));
    } else {
      store.setWorkDays([...store.workDays, workDay]);
    }
    return workDay;
  } catch (error) {
    console.error("Failed to add work day:", error);
    throw error;
  }
}

export async function removeWorkDay(memberId: string, date: string) {
  try {
    await workDaysAPI.delete(memberId, date);
    const store = getStore();
    store.setWorkDays(store.workDays.filter(w => 
      !(w.memberId === memberId && w.date === date)
    ));
  } catch (error) {
    console.error("Failed to remove work day:", error);
    throw error;
  }
}

export async function toggleWorkDayCar(memberId: string, date: string) {
  const store = getStore();
  const workDay = store.workDays.find(w => w.memberId === memberId && w.date === date);
  if (workDay) {
    return addWorkDay(memberId, date, !workDay.withCar);
  }
}

export async function toggleWorkDayDouble(memberId: string, date: string) {
  const store = getStore();
  const workDay = store.workDays.find(w => w.memberId === memberId && w.date === date);
  if (workDay) {
    try {
      const updated = await workDaysAPI.upsert({ 
        memberId, 
        date, 
        withCar: workDay.withCar,
        isDouble: !workDay.isDouble 
      });
      store.setWorkDays(store.workDays.map(w => 
        w.memberId === memberId && w.date === date ? updated : w
      ));
      return updated;
    } catch (error) {
      console.error("Failed to toggle double day:", error);
      throw error;
    }
  }
}

// ============ ACTIVITY ACTIONS ============

export async function createActivity(data: {
  type: string;
  action: string;
  subject: string;
  targetId?: string;
  projectId?: string;
  userId: string;
}) {
  try {
    const store = getStore();
    const activity = await activitiesAPI.create({
      ...data,
      userName: store.currentUser.name,
      userAvatar: store.currentUser.avatar,
    });
    store.setActivities([activity, ...store.activities].slice(0, store.maxActivities));
    return activity;
  } catch (error) {
    console.error("Failed to create activity:", error);
    // Don't throw - activities are not critical
  }
}

export async function clearActivities() {
  try {
    await activitiesAPI.clear();
    const store = getStore();
    store.setActivities([]);
  } catch (error) {
    console.error("Failed to clear activities:", error);
    throw error;
  }
}

// ============ SETTINGS ACTIONS ============

export async function updateSettings(updates: any) {
  try {
    const settings = await settingsAPI.update(updates);
    const store = getStore();
    store.updateSystemSettings(settings);
    return settings;
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw error;
  }
}

// ============ INVITE CODE ACTIONS ============

export async function generateInviteCode() {
  try {
    const result = await inviteCodesAPI.generate();
    const store = getStore();
    store.updateSystemSettings({
      inviteCodes: [...store.systemSettings.inviteCodes, result.code]
    });
    return result.code;
  } catch (error) {
    console.error("Failed to generate invite code:", error);
    throw error;
  }
}

export async function deleteInviteCode(code: string) {
  try {
    await inviteCodesAPI.delete(code);
    const store = getStore();
    store.updateSystemSettings({
      inviteCodes: store.systemSettings.inviteCodes.filter(c => c !== code)
    });
  } catch (error) {
    console.error("Failed to delete invite code:", error);
    throw error;
  }
}


// ============ COMMENT ACTIONS ============

export async function addComment(taskId: string, text: string, authorId: string) {
  try {
    const comment = await commentsAPI.create({ taskId, text, authorId });
    // Update task in store with new comment
    const store = getStore();
    const task = store.tasks.find(t => t.id === taskId);
    
    store.setTasks(store.tasks.map(t => {
      if (t.id === taskId) {
        const comments = t.comments || [];
        // Keep max 10 comments
        const newComments = [...comments, comment].slice(-10);
        return { ...t, comments: newComments };
      }
      return t;
    }));
    
    // Create activity for comment
    if (task) {
      await createActivity({
        type: "task",
        action: "commented",
        subject: task.title,
        userId: store.currentUser.id,
        targetId: taskId,
        projectId: task.projectId,
      });
    }
    
    return comment;
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
}

export async function loadTaskComments(taskId: string) {
  try {
    const comments = await commentsAPI.getByTask(taskId);
    const store = getStore();
    store.setTasks(store.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, comments };
      }
      return t;
    }));
    return comments; // Return comments for direct use
  } catch (error) {
    console.error("Failed to load comments:", error);
    return null;
  }
}


// ============ COLUMN ACTIONS ============

export async function createColumn(projectId: string, data: { name: { ru: string; en: string }; color: string }) {
  try {
    const column = await columnsAPI.create({ projectId, ...data });
    const store = getStore();
    store.setProjects(store.projects.map(p => {
      if (p.id === projectId) {
        return { ...p, columns: [...p.columns, column] };
      }
      return p;
    }));
    return column;
  } catch (error) {
    console.error("Failed to create column:", error);
    throw error;
  }
}

export async function updateColumn(columnId: string, updates: any) {
  try {
    const column = await columnsAPI.update(columnId, updates);
    const store = getStore();
    store.setProjects(store.projects.map(p => ({
      ...p,
      columns: p.columns.map(c => c.id === columnId ? { ...c, ...updates } : c)
    })));
    return column;
  } catch (error) {
    console.error("Failed to update column:", error);
    throw error;
  }
}

export async function deleteColumn(columnId: string) {
  try {
    await columnsAPI.delete(columnId);
    const store = getStore();
    store.setProjects(store.projects.map(p => ({
      ...p,
      columns: p.columns.filter(c => c.id !== columnId)
    })));
  } catch (error) {
    console.error("Failed to delete column:", error);
    throw error;
  }
}

export async function reorderColumns(projectId: string, columnIds: string[]) {
  try {
    await columnsAPI.reorder(projectId, columnIds);
    const store = getStore();
    store.setProjects(store.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        columns: columnIds.map((id, index) => {
          const col = p.columns.find(c => c.id === id);
          return col ? { ...col, order: index } : col;
        }).filter(Boolean) as typeof p.columns
      };
    }));
  } catch (error) {
    console.error("Failed to reorder columns:", error);
    throw error;
  }
}

export async function archiveTask(taskId: string) {
  try {
    const task = await tasksAPI.update(taskId, { 
      archivedAt: new Date().toISOString() 
    });
    const store = getStore();
    store.setTasks(store.tasks.map(t => t.id === taskId ? { ...t, archivedAt: task.archivedAt } : t));
    return task;
  } catch (error) {
    console.error("Failed to archive task:", error);
    throw error;
  }
}

// ============ AUTH ACTIONS ============

export async function registerUser(data: { name: string; email: string; phone: string; password: string; inviteCode?: string }) {
  try {
    const result = await authAPI.register(data);
    if (result.success && result.user) {
      const store = getStore();
      store.setAuthenticated(true);
      store.setCurrentUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
        role: result.user.role,
        avatar: result.user.avatar,
      });
    }
    return result;
  } catch (error) {
    console.error("Failed to register:", error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const result = await authAPI.login(email, password);
    if (result.success && result.user) {
      const store = getStore();
      store.setAuthenticated(true);
      store.setCurrentUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
        role: result.user.role,
        avatar: result.user.avatar,
      });
    }
    return result;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error;
  }
}

// ============ ATTACHMENT ACTIONS ============

export async function uploadAttachment(taskId: string, file: File) {
  try {
    const { uploadAPI } = await import("./api");
    const result = await uploadAPI.uploadFile(file);
    
    // Update task with new attachment
    const store = getStore();
    const task = store.tasks.find(t => t.id === taskId);
    if (task) {
      const attachments = [...(task.attachments || []), result.url];
      await updateTask(taskId, { attachments });
    }
    
    return result.url;
  } catch (error) {
    console.error("Failed to upload attachment:", error);
    throw error;
  }
}

export async function removeAttachment(taskId: string, attachmentUrl: string) {
  try {
    const store = getStore();
    const task = store.tasks.find(t => t.id === taskId);
    if (task) {
      const attachments = (task.attachments || []).filter(a => a !== attachmentUrl);
      await updateTask(taskId, { attachments });
    }
  } catch (error) {
    console.error("Failed to remove attachment:", error);
    throw error;
  }
}

// ============ LEAD COMMENT ACTIONS ============

export async function addLeadComment(leadId: string, text: string, authorId: string) {
  try {
    const comment = await leadCommentsAPI.create({ leadId, text, authorId });
    const store = getStore();
    const lead = store.leads.find(l => l.id === leadId);
    
    // Create activity for comment
    if (lead) {
      await createActivity({
        type: "lead",
        action: "commented",
        subject: lead.name,
        userId: store.currentUser.id,
        targetId: leadId,
      });
    }
    
    return comment;
  } catch (error) {
    console.error("Failed to add lead comment:", error);
    throw error;
  }
}

export async function loadLeadComments(leadId: string) {
  try {
    const comments = await leadCommentsAPI.getByLead(leadId);
    return comments;
  } catch (error) {
    console.error("Failed to load lead comments:", error);
    return [];
  }
}

// ============ CALENDAR NOTES ACTIONS ============

export async function loadCalendarNotes() {
  try {
    const notes = await calendarNotesAPI.getAll();
    const store = getStore();
    store.setCalendarNotes(notes);
    return notes;
  } catch (error) {
    console.error("Failed to load calendar notes:", error);
    return [];
  }
}

export async function createCalendarNote(date: string, text: string, attachments?: string[]) {
  try {
    const note = await calendarNotesAPI.create({ date, text, attachments });
    const store = getStore();
    store.setCalendarNotes([...store.calendarNotes, note]);
    return note;
  } catch (error) {
    console.error("Failed to create calendar note:", error);
    throw error;
  }
}

export async function updateCalendarNote(id: string, updates: { text?: string; attachments?: string[] }) {
  try {
    const note = await calendarNotesAPI.update(id, updates);
    const store = getStore();
    store.setCalendarNotes(store.calendarNotes.map(n => n.id === id ? note : n));
    return note;
  } catch (error) {
    console.error("Failed to update calendar note:", error);
    throw error;
  }
}

export async function deleteCalendarNote(id: string) {
  try {
    await calendarNotesAPI.delete(id);
    const store = getStore();
    store.setCalendarNotes(store.calendarNotes.filter(n => n.id !== id));
  } catch (error) {
    console.error("Failed to delete calendar note:", error);
    throw error;
  }
}

// ============ USER SETTINGS ACTIONS ============

export async function loadUserSettings(userId: string) {
  try {
    const settings = await userSettingsAPI.get(userId);
    const store = getStore();
    if (settings.navOrder) {
      store.setNavOrder(settings.navOrder);
    }
    if (settings.revenueSources) {
      store.updateRevenueSettings({ sources: settings.revenueSources });
    }
    return settings;
  } catch (error) {
    console.error("Failed to load user settings:", error);
    return null;
  }
}

export async function saveNavOrder(userId: string, navOrder: string[]) {
  try {
    await userSettingsAPI.update({ userId, navOrder });
    const store = getStore();
    store.setNavOrder(navOrder);
  } catch (error) {
    console.error("Failed to save nav order:", error);
    throw error;
  }
}

export async function saveRevenueSettings(userId: string, revenueSources: any[]) {
  try {
    await userSettingsAPI.update({ userId, revenueSources });
    const store = getStore();
    store.updateRevenueSettings({ sources: revenueSources });
  } catch (error) {
    console.error("Failed to save revenue settings:", error);
    throw error;
  }
}
