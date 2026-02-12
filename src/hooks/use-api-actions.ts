"use client";

import { useCallback, useState } from "react";
import * as apiActions from "@/lib/api-actions";

// Hook that wraps API actions with loading state
export function useApiActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err: any) {
      setError(err.message || "Ошибка");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Team
  const createTeamMember = useCallback((data: Parameters<typeof apiActions.createTeamMember>[0]) => 
    withLoading(() => apiActions.createTeamMember(data)), [withLoading]);
  
  const updateTeamMember = useCallback((id: string, updates: any) => 
    withLoading(() => apiActions.updateTeamMember(id, updates)), [withLoading]);
  
  const deleteTeamMember = useCallback((id: string) => 
    withLoading(() => apiActions.deleteTeamMember(id)), [withLoading]);

  // Leads
  const createLead = useCallback((data: Parameters<typeof apiActions.createLead>[0]) => 
    withLoading(() => apiActions.createLead(data)), [withLoading]);
  
  const updateLead = useCallback((id: string, updates: any) => 
    withLoading(() => apiActions.updateLead(id, updates)), [withLoading]);
  
  const deleteLead = useCallback((id: string) => 
    withLoading(() => apiActions.deleteLead(id)), [withLoading]);
  
  const moveLead = useCallback((id: string, status: string) => 
    withLoading(() => apiActions.moveLead(id, status)), [withLoading]);

  // Tasks
  const createTask = useCallback((data: Parameters<typeof apiActions.createTask>[0]) => 
    withLoading(() => apiActions.createTask(data)), [withLoading]);
  
  const updateTask = useCallback((id: string, updates: any) => 
    withLoading(() => apiActions.updateTask(id, updates)), [withLoading]);
  
  const deleteTask = useCallback((id: string) => 
    withLoading(() => apiActions.deleteTask(id)), [withLoading]);
  
  const moveTask = useCallback((id: string, status: string) => 
    withLoading(() => apiActions.moveTask(id, status)), [withLoading]);

  const reorderTasks = useCallback((taskIds: string[], columnId?: string) => 
    withLoading(() => apiActions.reorderTasks(taskIds, columnId)), [withLoading]);

  // Projects
  const createProject = useCallback((data: Parameters<typeof apiActions.createProject>[0]) => 
    withLoading(() => apiActions.createProject(data)), [withLoading]);
  
  const updateProject = useCallback((id: string, updates: any) => 
    withLoading(() => apiActions.updateProject(id, updates)), [withLoading]);
  
  const deleteProject = useCallback((id: string) => 
    withLoading(() => apiActions.deleteProject(id)), [withLoading]);

  // Work Days
  const addWorkDay = useCallback((memberId: string, date: string, withCar?: boolean) => 
    withLoading(() => apiActions.addWorkDay(memberId, date, withCar)), [withLoading]);
  
  const removeWorkDay = useCallback((memberId: string, date: string) => 
    withLoading(() => apiActions.removeWorkDay(memberId, date)), [withLoading]);
  
  const toggleWorkDayCar = useCallback((memberId: string, date: string) => 
    withLoading(() => apiActions.toggleWorkDayCar(memberId, date)), [withLoading]);
  
  const toggleWorkDayDouble = useCallback((memberId: string, date: string) => 
    withLoading(() => apiActions.toggleWorkDayDouble(memberId, date)), [withLoading]);

  // Activities
  const createActivity = useCallback((data: Parameters<typeof apiActions.createActivity>[0]) => 
    apiActions.createActivity(data), []); // No loading for activities
  
  const clearActivities = useCallback(() => 
    withLoading(() => apiActions.clearActivities()), [withLoading]);

  // Settings
  const updateSettings = useCallback((updates: any) => 
    withLoading(() => apiActions.updateSettings(updates)), [withLoading]);

  // Invite Codes
  const generateInviteCode = useCallback(() => 
    withLoading(() => apiActions.generateInviteCode()), [withLoading]);
  
  const deleteInviteCode = useCallback((code: string) => 
    withLoading(() => apiActions.deleteInviteCode(code)), [withLoading]);

  // Comments
  const addComment = useCallback((taskId: string, text: string, authorId: string) => 
    withLoading(() => apiActions.addComment(taskId, text, authorId)), [withLoading]);
  
  const loadTaskComments = useCallback((taskId: string) => 
    apiActions.loadTaskComments(taskId), []); // No loading state for this

  // Columns
  const createColumn = useCallback((projectId: string, data: { name: { ru: string; en: string }; color: string }) => 
    withLoading(() => apiActions.createColumn(projectId, data)), [withLoading]);
  
  const updateColumnApi = useCallback((columnId: string, updates: any) => 
    withLoading(() => apiActions.updateColumn(columnId, updates)), [withLoading]);
  
  const deleteColumnApi = useCallback((columnId: string) => 
    withLoading(() => apiActions.deleteColumn(columnId)), [withLoading]);

  const reorderColumnsApi = useCallback((projectId: string, columnIds: string[]) => 
    withLoading(() => apiActions.reorderColumns(projectId, columnIds)), [withLoading]);

  // Archive
  const archiveTaskApi = useCallback((taskId: string) => 
    withLoading(() => apiActions.archiveTask(taskId)), [withLoading]);

  // Auth
  const register = useCallback((data: { name: string; email: string; phone: string; password: string; inviteCode?: string }) => 
    withLoading(() => apiActions.registerUser(data)), [withLoading]);
  
  const login = useCallback((email: string, password: string) => 
    withLoading(() => apiActions.loginUser(email, password)), [withLoading]);

  // Attachments
  const uploadAttachment = useCallback((taskId: string, file: File) => 
    withLoading(() => apiActions.uploadAttachment(taskId, file)), [withLoading]);
  
  const removeAttachmentApi = useCallback((taskId: string, attachmentUrl: string) => 
    withLoading(() => apiActions.removeAttachment(taskId, attachmentUrl)), [withLoading]);

  return {
    loading,
    error,
    // Team
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    // Leads
    createLead,
    updateLead,
    deleteLead,
    moveLead,
    // Tasks
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    // Projects
    createProject,
    updateProject,
    deleteProject,
    // Work Days
    addWorkDay,
    removeWorkDay,
    toggleWorkDayCar,
    toggleWorkDayDouble,
    // Activities
    createActivity,
    clearActivities,
    // Settings
    updateSettings,
    // Invite Codes
    generateInviteCode,
    deleteInviteCode,
    // Comments
    addComment,
    loadTaskComments,
    // Columns
    createColumn,
    updateColumn: updateColumnApi,
    deleteColumn: deleteColumnApi,
    reorderColumns: reorderColumnsApi,
    // Archive
    archiveTask: archiveTaskApi,
    // Auth
    register,
    login,
    // Attachments
    uploadAttachment,
    removeAttachment: removeAttachmentApi,
    // Calendar Notes
    loadCalendarNotes: useCallback(() => apiActions.loadCalendarNotes(), []),
    createCalendarNote: useCallback((date: string, text: string, attachments?: string[]) => 
      withLoading(() => apiActions.createCalendarNote(date, text, attachments)), [withLoading]),
    updateCalendarNote: useCallback((id: string, updates: { text?: string; attachments?: string[] }) => 
      withLoading(() => apiActions.updateCalendarNote(id, updates)), [withLoading]),
    deleteCalendarNote: useCallback((id: string) => 
      withLoading(() => apiActions.deleteCalendarNote(id)), [withLoading]),
    // User Settings
    loadUserSettings: useCallback((userId: string) => apiActions.loadUserSettings(userId), []),
    saveNavOrder: useCallback((userId: string, navOrder: string[]) => 
      withLoading(() => apiActions.saveNavOrder(userId, navOrder)), [withLoading]),
    saveRevenueSettings: useCallback((userId: string, revenueSources: any[]) => 
      withLoading(() => apiActions.saveRevenueSettings(userId, revenueSources)), [withLoading]),
  };
}
