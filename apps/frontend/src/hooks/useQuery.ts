/**
 * MCMS Query Hooks — TanStack Query v5 wrappers for all API endpoints.
 * Each hook uses stable query keys for cache invalidation and background refetch.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type {
  AdminDashboardData,
  UserDashboardData,
  Metal,
  Grade,
  RawMaterial,
  Alloy,
  Calculation
} from "@jsw-mcms/types";

// ── Query Key Registry ────────────────────────────────────────────────────────
export const QK = {
  adminDashboard: ["dashboard", "admin"] as const,
  userDashboard: ["dashboard", "user"] as const,
  metals: (search?: string) => ["metals", search ?? ""] as const,
  grades: (metalId?: string) => ["grades", metalId ?? ""] as const,
  rawMaterials: ["rawMaterials"] as const,
  suppliers: ["suppliers"] as const,
  prices: (metalId?: string) => ["prices", metalId ?? ""] as const,
  priceHistory: ["priceHistory"] as const,
  alloys: ["alloys"] as const,
  calculations: ["calculations"] as const,
  calculation: (id: string) => ["calculations", id] as const,
  notifications: ["notifications"] as const,
  reports: ["reports"] as const,
  users: ["users"] as const,
  auditLogs: ["auditLogs"] as const,
  settings: ["settings"] as const,
  gstSlabs: ["gstSlabs"] as const,
  comparison: ["comparison"] as const
} as const;

// ── Dashboard Queries ─────────────────────────────────────────────────────────
export function useAdminDashboard() {
  return useQuery({
    queryKey: QK.adminDashboard,
    queryFn: async () => {
      const { data } = await api.get<AdminDashboardData>("/dashboard/admin");
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000
  });
}

export function useUserDashboard() {
  return useQuery({
    queryKey: QK.userDashboard,
    queryFn: async () => {
      const { data } = await api.get<UserDashboardData>("/dashboard/user");
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000
  });
}

// ── Master Data Queries ───────────────────────────────────────────────────────
export function useMetals(search?: string) {
  return useQuery({
    queryKey: QK.metals(search),
    queryFn: async () => {
      const { data } = await api.get<{ data: Metal[] }>("/metals", {
        params: { search, limit: 100 }
      });
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

export function useGrades(metalId?: string) {
  return useQuery({
    queryKey: QK.grades(metalId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Grade[] }>("/grades", {
        params: { metalId, limit: 100 }
      });
      return data.data;
    },
    staleTime: 5 * 60_000,
    enabled: !!metalId
  });
}

export function useAllGrades() {
  return useQuery({
    queryKey: QK.grades(),
    queryFn: async () => {
      const { data } = await api.get<{ data: Grade[] }>("/grades", { params: { limit: 200 } });
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

export function useRawMaterials() {
  return useQuery({
    queryKey: QK.rawMaterials,
    queryFn: async () => {
      const { data } = await api.get<{ data: RawMaterial[] }>("/raw-materials", { params: { limit: 100 } });
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

export function useAlloys() {
  return useQuery({
    queryKey: QK.alloys,
    queryFn: async () => {
      const { data } = await api.get<{ data: Alloy[] }>("/alloys", { params: { limit: 100 } });
      return data.data;
    },
    staleTime: 3 * 60_000
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: QK.suppliers,
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>("/suppliers", { params: { limit: 100 } });
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

export function usePrices(metalId?: string) {
  return useQuery({
    queryKey: QK.prices(metalId),
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>("/prices", { params: { metalId, limit: 100 } });
      return data.data;
    },
    staleTime: 3 * 60_000
  });
}

// ── Calculation Queries ────────────────────────────────────────────────────────
export function useCalculations() {
  return useQuery({
    queryKey: QK.calculations,
    queryFn: async () => {
      const { data } = await api.get<{ data: Calculation[] }>("/calculations", { params: { limit: 50 } });
      return data.data;
    },
    staleTime: 30_000
  });
}

export function useCalculation(id: string) {
  return useQuery({
    queryKey: QK.calculation(id),
    queryFn: async () => {
      const { data } = await api.get<Calculation>(`/calculations/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 60_000
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: QK.notifications,
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>("/notifications", { params: { limit: 20 } });
      return data.data;
    },
    staleTime: 15_000,
    refetchInterval: 15_000
  });
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function useAuditLogs(page = 1, limit = 20, filters?: AuditLogFilters) {
  return useQuery({
    queryKey: [...QK.auditLogs, page, limit, filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[]; pagination: unknown }>("/audit-logs", {
        params: { page, limit, ...filters }
      });
      return data;
    },
    staleTime: 30_000
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: QK.users,
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[]; roles: unknown[] }>("/users");
      return data;
    },
    staleTime: 60_000
  });
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function useSettings(category?: string) {
  return useQuery({
    queryKey: [...QK.settings, category ?? "all"],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>("/settings", { params: { category } });
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

export function useGstSlabs() {
  return useQuery({
    queryKey: QK.gstSlabs,
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[] }>("/settings/gst/slabs");
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

// ── Comparison Query ──────────────────────────────────────────────────────────
export function useComparisonGrades() {
  return useQuery({
    queryKey: QK.comparison,
    queryFn: async () => {
      const { data } = await api.get<{ data: Grade[] }>("/comparisons");
      return data.data;
    },
    staleTime: 5 * 60_000
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications })
  });
}

export function useCompleteCalculation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/calculations/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.calculations })
  });
}
