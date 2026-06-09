<template>
  <header class="topbar">
    <div class="topbar-start">
      <h2 class="page-title">{{ title }}</h2>
    </div>
    <div class="topbar-end">
      <!-- Notifications -->
      <div class="notif-btn" @click="toggleNotif" id="topbar-notifications">
        <span class="notif-icon">🔔</span>
        <span v-if="notifStore.unreadCount" class="notif-badge">{{ notifStore.unreadCount }}</span>
      </div>

      <!-- Notification Dropdown -->
      <div v-if="showNotif" class="notif-dropdown">
        <div class="notif-header">
          <span>الإشعارات</span>
          <button @click="notifStore.markAllRead()">قراءة الكل</button>
        </div>
        <div class="notif-list">
          <div
            v-for="n in notifStore.notifications.slice(0,8)"
            :key="n.id"
            :class="['notif-item', { unread: !n.is_read }]"
            @click="notifStore.markOneRead(n.id)"
          >
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-msg">{{ n.message }}</div>
          </div>
          <div v-if="!notifStore.notifications.length" class="notif-empty">لا توجد إشعارات</div>
        </div>
      </div>

      <!-- Logout -->
      <button class="logout-btn" id="topbar-logout" @click="handleLogout">
        <span>خروج</span> 
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuth } from '@/composables/useAuth'

defineProps({ title: { type: String, default: '' } })

const notifStore = useNotificationsStore()
const { logout: handleLogout } = useAuth()
const showNotif = ref(false)

function toggleNotif() {
  showNotif.value = !showNotif.value
  if (showNotif.value) notifStore.fetchNotifications()
}
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0; left: 0;
  right: var(--sidebar-width);
  height: var(--topbar-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 99;
}
.page-title { font-size: 1.1rem; font-weight: 700; }
.topbar-end { display: flex; align-items: center; gap: 1rem; }

.notif-btn {
  position: relative;
  width: 36px; height: 36px;
  background: var(--color-surface-2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 1rem;
  transition: background var(--transition);
}
.notif-btn:hover { background: var(--color-border); }
.notif-badge {
  position: absolute; top: -4px; left: -4px;
  background: var(--color-danger); color: #fff;
  font-size: .65rem; font-weight: 700;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.notif-dropdown {
  position: absolute;
  top: calc(var(--topbar-height) - 8px); left: 1.5rem;
  width: 340px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
}
.notif-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600; font-size: .9rem;
}
.notif-header button {
  background: none; border: none;
  color: var(--color-accent); font-size: .8rem; cursor: pointer;
}
.notif-list { max-height: 300px; overflow-y: auto; }
.notif-item {
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition);
}
.notif-item:hover { background: var(--color-surface-2); }
.notif-item.unread { border-right: 3px solid var(--color-accent); }
.notif-title { font-size: .85rem; font-weight: 600; }
.notif-msg   { font-size: .78rem; color: var(--color-text-muted); margin-top: .2rem; }
.notif-empty { padding: 1.5rem; text-align: center; color: var(--color-text-muted); font-size: .85rem; }

.logout-btn {
  display: flex; align-items: center; gap: .4rem;
  background: none; border: 1.5px solid var(--color-border);
  color: var(--color-text-muted); border-radius: var(--radius-sm);
  padding: .4rem .9rem; font-size: .85rem; cursor: pointer;
  font-family: var(--font);
  transition: all var(--transition);
}
.logout-btn:hover { border-color: var(--color-danger); color: var(--color-danger); }
</style>
