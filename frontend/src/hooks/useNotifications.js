import { useEffect, useRef } from 'react'
import { useNotificationsStore } from '@/stores/notifications'

export function useNotifications() {
  const store = useNotificationsStore()
  const intervalRef = useRef(null)

  useEffect(() => {
    store.fetchNotifications()
    intervalRef.current = setInterval(() => store.fetchNotifications(), 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    notifications: store.notifications,
    unreadCount: store.notifications.filter(n => !n.is_read).length,
    store,
  }
}
