'use client';

import { create } from 'zustand';
import { notificationsApi } from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationState {
  notifications:    Notification[];
  unreadCount:      number;
  isLoading:        boolean;
  wsConnected:      boolean;

  // Actions
  fetchNotifications:       () => Promise<void>;
  markAsRead:               (id: number) => Promise<void>;
  markAllAsRead:            () => Promise<void>;
  deleteNotification:       (id: number) => void;
  addRealTimeNotification:  (notification: Notification) => void;
  setWsConnected:           (connected: boolean) => void;
  fetchUnreadCount:         () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount:   0,
  isLoading:     false,
  wsConnected:   false,

  // ── Fetch all notifications ───────────────────────────────────────────────
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationsApi.getAll({ size: 50 }) as {
        content: Notification[];
      };
      const notifications = Array.isArray(data) ? data : data?.content ?? [];
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        isLoading:   false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── Mark single notification as read ─────────────────────────────────────
  markAsRead: async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  // ── Mark all as read ──────────────────────────────────────────────────────
  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount:   0,
      }));
    } catch {
      // ignore
    }
  },

  // ── Delete notification ───────────────────────────────────────────────────
  deleteNotification: (id: number) => {
    set((state) => {
      const n = state.notifications.find((notif) => notif.id === id);
      return {
        notifications: state.notifications.filter((notif) => notif.id !== id),
        unreadCount:   n && !n.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  // ── Add real-time notification from WebSocket ────────────────────────────
  addRealTimeNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100),
      unreadCount:   state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },

  // ── WebSocket connection state ────────────────────────────────────────────
  setWsConnected: (connected: boolean) => set({ wsConnected: connected }),

  // ── Fetch unread count only ───────────────────────────────────────────────
  fetchUnreadCount: async () => {
    try {
      const result = await notificationsApi.getUnreadCount() as { count: number } | number;
      const count = typeof result === 'number' ? result : (result as { count: number }).count;
      set({ unreadCount: count ?? 0 });
    } catch {
      // ignore
    }
  },
}));
