import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UIState {
  mobileSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  searchOpen: boolean;
  erpTheme: "jsw-classic" | "high-density-gray" | "oracle-dark";
  setMobileSidebarOpen: (open: boolean) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setErpTheme: (theme: "jsw-classic" | "high-density-gray" | "oracle-dark") => void;
  toggleSidebar: () => void;
}

// ── Persistent UI Preferences Store ───────────────────────────────────────────
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mobileSidebarOpen: false,
      isSidebarCollapsed: false,
      searchOpen: false,
      erpTheme: "jsw-classic",

      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setErpTheme: (erpTheme) => set({ erpTheme }),
      
      toggleSidebar: () => set((state) => ({ 
        isSidebarCollapsed: !state.isSidebarCollapsed 
      }))
    }),
    {
      name: "mcms-ui-storage",
      storage: createJSONStorage(() => localStorage), // Persist UI preferences in localStorage
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        erpTheme: state.erpTheme
      })
    }
  )
);

export default useUIStore;
