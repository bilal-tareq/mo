import { create } from 'zustand'
import { notificationsApi } from '@/api/notifications'

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  loading: false,

  get unreadCount() {
    return get().notifications.filter(n => !n.is_read).length
  },

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const { data } = await notificationsApi.list()
      set({ notifications: data.results || data })
    } finally {
      set({ loading: false })
    }
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead()
    set({
      notifications: get().notifications.map(n => ({ ...n, is_read: true })),
    })
  },

  markOneRead: async (id) => {
    await notificationsApi.markOneRead(id)
    set({
      notifications: get().notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    })
  },

  addNotification: (notification) => {
    set({ notifications: [notification, ...get().notifications] })
  },
}))
