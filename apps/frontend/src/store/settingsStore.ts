import { create } from "zustand";
import { api } from "../services/api";

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
  description?: string;
  updatedById?: string;
  updatedAt: string;
}

interface SettingsState {
  settings: SystemSetting[];
  isLoading: boolean;
  error: string | null;
  
  fetchSettings: () => Promise<void>;
  updateBulkSettings: (values: Record<string, string>) => Promise<void>;
  updateProfile: (profile: { name?: string; department?: string; password?: string }) => Promise<any>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settingsRes = await api.get<{ data: SystemSetting[] }>("/settings");
      set({ 
        settings: settingsRes.data?.data || [], 
        isLoading: false 
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to fetch settings from server.",
        isLoading: false 
      });
    }
  },

  updateBulkSettings: async (values: Record<string, string>) => {
    set({ isLoading: true, error: null });
    try {
      await api.put("/settings", values);
      // Refetch to sync local state
      await get().fetchSettings();
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to update system settings.",
        isLoading: false 
      });
      throw err;
    }
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put("/auth/profile", profile);
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || "Failed to update profile.",
        isLoading: false 
      });
      throw err;
    }
  }
}));
