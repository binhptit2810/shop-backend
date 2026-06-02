import { create } from 'zustand';
import API from '../services/api';
import { NotificationResponse } from '../types';

interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  addNotificationLocally: (n: NotificationResponse) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await API.get('/notifications');
      const items = response.data || [];
      const unread = items.filter((n: any) => !n.isRead).length;
      set({ notifications: items, unreadCount: unread });
    } catch (error) {
      console.error("Error loading notifications", error);
    } finally {
      set({ loading: false });
    }
  },
  markAsRead: async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      const updated = get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      const unread = updated.filter(n => !n.isRead).length;
      set({ notifications: updated, unreadCount: unread });
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  },
  addNotificationLocally: (n) => {
    const updated = [n, ...get().notifications];
    const unread = updated.filter(item => !item.isRead).length;
    set({ notifications: updated, unreadCount: unread });
  }
}));
