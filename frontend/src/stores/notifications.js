import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationsApi } from '@/api/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading       = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

  async function fetchNotifications() {
    loading.value = true
    try {
      const { data } = await notificationsApi.list()
      notifications.value = data.results || data
    } finally {
      loading.value = false
    }
  }

  async function markAllRead() {
    await notificationsApi.markAllRead()
    notifications.value.forEach(n => (n.is_read = true))
  }

  async function markOneRead(id) {
    await notificationsApi.markOneRead(id)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.is_read = true
  }

  function addNotification(notification) {
    notifications.value.unshift(notification)
  }

  return { notifications, loading, unreadCount, fetchNotifications, markAllRead, markOneRead, addNotification }
})
