import type { AdminDashboardData, Alloy, Calculation, Grade, Metal, Notice, UserDashboardData } from "@/types";

export const grades: Grade[] = [];
export const metals: Metal[] = [];
export const rawMaterials: any[] = [];
export const alloys: Alloy[] = [];
export const notices: Notice[] = [];
export const calculations: Calculation[] = [];

export const adminDashboard: AdminDashboardData = {
  kpis: { calculations: 0, alloys: 0, rawMaterials: 0, activeUsers: 0, metals: 0, estimatedValue: 0 },
  series: [],
  topAlloys: [],
  statuses: [],
  recent: [],
  activity: [],
  notices: [],
  systemSummary: { roles: 0, gstSlabs: 0, priceLists: 0, reports: 0 }
};

export const userDashboard: UserDashboardData = {
  kpis: { calculations: 0, savedAlloys: 0, estimatedValue: 0, recentActivity: 0 },
  series: [],
  recent: [],
  notices: [],
  saved: []
};

