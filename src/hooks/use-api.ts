"use client";

import { useEffect, useCallback } from "react";
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
} from "@/lib/api";

// Hook to load team members from API
export function useTeamSync() {
  const { setTeamMembers, isAuthenticated } = useStore();

  const loadTeam = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const members = await teamAPI.getAll();
      setTeamMembers(members.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone || "",
        role: m.role,
        avatar: m.avatar,
        isOnline: m.isOnline,
        isAdmin: m.isAdmin,
        dailyRate: m.dailyRate || 0,
        carBonus: m.carBonus || 0,
        lastSeen: m.lastSeen,
        createdAt: m.createdAt,
      })));
    } catch (error) {
      console.error("Failed to load team:", error);
    }
  }, [isAuthenticated, setTeamMembers]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  return { reload: loadTeam };
}

// Hook to load projects from API
export function useProjectsSync() {
  const { setProjects, isAuthenticated } = useStore();

  const loadProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const projects = await projectsAPI.getAll();
      if (projects.length > 0) {
        setProjects(projects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  }, [isAuthenticated, setProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { reload: loadProjects };
}

// Hook to load tasks from API
export function useTasksSync() {
  const { setTasks, currentProjectId, isAuthenticated } = useStore();

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const tasks = await tasksAPI.getAll(currentProjectId);
      setTasks(tasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }, [isAuthenticated, currentProjectId, setTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return { reload: loadTasks };
}

// Hook to load leads from API
export function useLeadsSync() {
  const { setLeads, isAuthenticated } = useStore();

  const loadLeads = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const leads = await leadsAPI.getAll();
      setLeads(leads);
    } catch (error) {
      console.error("Failed to load leads:", error);
    }
  }, [isAuthenticated, setLeads]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return { reload: loadLeads };
}

// Hook to load activities from API
export function useActivitiesSync() {
  const { setActivities, maxActivities, isAuthenticated } = useStore();

  const loadActivities = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const activities = await activitiesAPI.getAll(maxActivities);
      setActivities(activities);
    } catch (error) {
      console.error("Failed to load activities:", error);
    }
  }, [isAuthenticated, maxActivities, setActivities]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return { reload: loadActivities };
}

// Hook to load work days from API
export function useWorkDaysSync(memberId?: string, month?: number, year?: number) {
  const { setWorkDays, isAuthenticated } = useStore();

  const loadWorkDays = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const workDays = await workDaysAPI.getAll(memberId, month, year);
      setWorkDays(workDays);
    } catch (error) {
      console.error("Failed to load work days:", error);
    }
  }, [isAuthenticated, memberId, month, year, setWorkDays]);

  useEffect(() => {
    loadWorkDays();
  }, [loadWorkDays]);

  return { reload: loadWorkDays };
}

// Hook to load system settings from API
export function useSettingsSync() {
  const { updateSystemSettings, isAuthenticated } = useStore();

  const loadSettings = useCallback(async () => {
    try {
      const settings = await settingsAPI.get();
      updateSystemSettings(settings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, [updateSystemSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { reload: loadSettings };
}

// Combined hook to sync all data
export function useDataSync() {
  const teamSync = useTeamSync();
  const projectsSync = useProjectsSync();
  const tasksSync = useTasksSync();
  const leadsSync = useLeadsSync();
  const activitiesSync = useActivitiesSync();

  const reloadAll = useCallback(async () => {
    await Promise.all([
      teamSync.reload(),
      projectsSync.reload(),
      tasksSync.reload(),
      leadsSync.reload(),
      activitiesSync.reload(),
    ]);
  }, [teamSync, projectsSync, tasksSync, leadsSync, activitiesSync]);

  return { reloadAll };
}
