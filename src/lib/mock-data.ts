import type { Lead, Task, TeamMember, Activity, Comment } from "@/store";

// Empty data - all mock data cleared
export const mockLeads: Lead[] = [];
export const mockTasks: Task[] = [];
export const mockTeamMembers: TeamMember[] = [];
export const mockActivities: Activity[] = [];

// Revenue data for chart (keeping for demo purposes)
export const mockRevenueData = [
  { month: "Авг", revenue: 0, forecast: 0 },
  { month: "Сен", revenue: 0, forecast: 0 },
  { month: "Окт", revenue: 0, forecast: 0 },
  { month: "Ноя", revenue: 0, forecast: 0 },
  { month: "Дек", revenue: 0, forecast: 0 },
  { month: "Янв", revenue: 0, forecast: 0 },
];

export const mockRevenueDataEn = [
  { month: "Aug", revenue: 0, forecast: 0 },
  { month: "Sep", revenue: 0, forecast: 0 },
  { month: "Oct", revenue: 0, forecast: 0 },
  { month: "Nov", revenue: 0, forecast: 0 },
  { month: "Dec", revenue: 0, forecast: 0 },
  { month: "Jan", revenue: 0, forecast: 0 },
];
