import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Notice } from "@jsw-mcms/types";
import { notices as fixtureNotices } from "../data/fixtures";

export interface NotificationState {
  notices: Notice[];
  unreadCount: number;
  setNotices: (notices: Notice[]) => void;
  addNotice: (notice: Notice) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// ── Persistent Notification Feed Store ──────────────────────────────────────────
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notices: fixtureNotices,
      unreadCount: fixtureNotices.filter((n) => !n.readAt).length,

      setNotices: (notices) =>
        set({
          notices,
          unreadCount: notices.filter((n) => !n.readAt).length
        }),

      addNotice: (notice) =>
        set((state) => {
          const nextNotices = [notice, ...state.notices];
          return {
            notices: nextNotices,
            unreadCount: nextNotices.filter((n) => !n.readAt).length
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          const nextNotices = state.notices.map((n) =>
            n.id === id ? { ...n, readAt: new Date().toISOString() } : n
          );
          return {
            notices: nextNotices,
            unreadCount: nextNotices.filter((n) => !n.readAt).length
          };
        }),

      markAllAsRead: () =>
        set((state) => {
          const now = new Date().toISOString();
          const nextNotices = state.notices.map((n) => ({ ...n, readAt: now }));
          return {
            notices: nextNotices,
            unreadCount: 0
          };
        })
    }),
    {
      name: "mcms-notification-storage",
      storage: createJSONStorage(() => localStorage), // Persist notices cache in localStorage
      partialize: (state) => ({
        notices: state.notices,
        unreadCount: state.unreadCount
      })
    }
  )
);

export default useNotificationStore;
