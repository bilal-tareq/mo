import { useNotificationsStore } from '@/stores/notifications'
import { onMounted, onUnmounted } from 'vue'

export function useNotifications() {
  const store = useNotificationsStore()

  // Poll every 30s for new notifications (simple approach without WebSockets)
  let interval = null

  onMounted(async () => {
    await store.fetchNotifications()
    interval = setInterval(() => store.fetchNotifications(), 30000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return { store, unreadCount: store.unreadCount, notifications: store.notifications }
}
