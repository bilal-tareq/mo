<template>
  <header class="topbar">
    <div class="topbar-start">
      <h2 class="page-title">{{ translatedTitle }}</h2>
    </div>
    <div class="topbar-end">
      <!-- Language Switcher -->
      <button class="lang-btn" @click="toggleLang" id="topbar-lang-toggle">
        <span class="lang-icon">🌐</span>
        <span class="lang-text">{{ locale === 'ar' ? 'English' : 'العربية' }}</span>
      </button>

      <!-- Notifications -->
      <div class="notif-btn" @click="toggleNotif" id="topbar-notifications">
        <span class="notif-icon">🔔</span>
        <span v-if="notifStore.unreadCount" class="notif-badge">{{ notifStore.unreadCount }}</span>
      </div>

      <!-- Notification Dropdown -->
      <div v-if="showNotif" class="notif-dropdown">
        <div class="notif-header">
          <span>{{ t('common.notifications') }}</span>
          <button @click="notifStore.markAllRead()">{{ t('common.readAll') }}</button>
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
          <div v-if="!notifStore.notifications.length" class="notif-empty">{{ t('common.noNotifs') }}</div>
        </div>
      </div>

      <!-- Logout -->
      <button class="logout-btn" id="topbar-logout" @click="handleLogout">
        <span>{{ t('common.logout') }}</span> 
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({ title: { type: String, default: '' } })

const route = useRoute()
const notifStore = useNotificationsStore()
const { logout: handleLogout } = useAuth()
const { t, locale, setLocale } = useI18n()
const showNotif = ref(false)

const translatedTitle = computed(() => {
  if (props.title) return props.title
  const name = route.name
  if (!name) return ''
  
  // Map route name to translation key
  const mapping = {
    'owner-dashboard':  'nav.dashboard',
    'owner-branches':   'nav.branches',
    'owner-reports':    'nav.reports',
    'owner-users':      'nav.users',
    'branch-dashboard': 'nav.dashboard',
    'branch-inventory': 'nav.inventory',
    'branch-products':  'nav.products',
    'branch-customers': 'nav.customers',
    'branch-suppliers': 'nav.suppliers',
    'branch-sales':     'nav.sales',
  }
  
  const key = mapping[name]
  return key ? t(key) : name
})

function toggleNotif() {
  showNotif.value = !showNotif.value
  if (showNotif.value) notifStore.fetchNotifications()
}

function toggleLang() {
  setLocale(locale.value === 'ar' ? 'en' : 'ar')
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

.lang-btn {
  display: flex;
  align-items: center;
  gap: .4rem;
  background: none;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  padding: .4rem .9rem;
  font-size: .85rem;
  cursor: pointer;
  font-family: var(--font);
  transition: all var(--transition);
}
.lang-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-soft);
}
.lang-icon {
  font-size: 0.95rem;
}

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
  top: calc(var(--topbar-height) - 8px);
  width: 340px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
}
html[dir="rtl"] .notif-dropdown {
  left: 1.5rem;
  right: auto;
}
html[dir="ltr"] .notif-dropdown {
  right: 1.5rem;
  left: auto;
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
html[dir="rtl"] .notif-item.unread { border-right: 3px solid var(--color-accent); }
html[dir="ltr"] .notif-item.unread { border-left: 3px solid var(--color-accent); }

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
