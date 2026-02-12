"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import {
  teamAPI,
  projectsAPI,
  tasksAPI,
  leadsAPI,
  activitiesAPI,
  workDaysAPI,
  settingsAPI,
  calendarNotesAPI,
  userSettingsAPI,
  authAPI,
} from "@/lib/api";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    setTeamMembers,
    setProjects,
    setTasks,
    setLeads,
    setActivities,
    setWorkDays,
    setCalendarNotes,
    setNavOrder,
    updateRevenueSettings,
    updateSystemSettings,
    maxActivities,
    currentUser,
  } = useStore();

  // Load all data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        // Load in parallel - load ALL tasks (not filtered by project) for revenue calculation
        const [team, projects, tasks, leads, activities, workDays, settings, calendarNotes] = await Promise.all([
          teamAPI.getAll().catch(() => []),
          projectsAPI.getAll().catch(() => []),
          tasksAPI.getAll().catch(() => []), // Load ALL tasks
          leadsAPI.getAll().catch(() => []),
          activitiesAPI.getAll(maxActivities).catch(() => []),
          workDaysAPI.getAll().catch(() => []),
          settingsAPI.get().catch(() => null),
          calendarNotesAPI.getAll().catch(() => []),
        ]);

        // Update store
        if (team.length > 0) {
          setTeamMembers(team.map((m: any) => ({
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
        }

        if (projects.length > 0) {
          setProjects(projects);
        }

        setTasks(tasks);
        setLeads(leads);
        setActivities(activities);
        setWorkDays(workDays);
        setCalendarNotes(calendarNotes);

        if (settings) {
          updateSystemSettings(settings);
        }

        // Load user settings (navOrder, revenueSettings)
        if (currentUser?.id) {
          try {
            const userSettings = await userSettingsAPI.get(currentUser.id);
            if (userSettings?.navOrder) {
              setNavOrder(userSettings.navOrder);
            }
            if (userSettings?.revenueSources) {
              updateRevenueSettings({ sources: userSettings.revenueSources });
            }
          } catch (e) {
            // User settings not found, use defaults
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [isAuthenticated]); // Only reload when auth changes, not on project switch

  // Heartbeat - update lastSeen every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;

    // Send heartbeat immediately
    authAPI.heartbeat(currentUser.id, currentUser.email).catch(() => {});

    // Then every 30 seconds
    const interval = setInterval(() => {
      authAPI.heartbeat(currentUser.id, currentUser.email).catch(() => {});
    }, 30000);

    // On page close/refresh - try to send logout
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery on page close
      navigator.sendBeacon("/api/auth/logout", JSON.stringify({ 
        userId: currentUser.id, 
        email: currentUser.email 
      }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated, currentUser?.id]);

  return <>{children}</>;
}
