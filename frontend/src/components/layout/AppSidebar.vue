<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <span class="logo-icon"></span>
      <span class="logo-text">Fashion Chain</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <template v-for="group in filteredNavGroups" :key="group.label">
        <div class="nav-group-label">{{ group.label }}</div>
        <RouterLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          :id="`nav-${item.id}`"
          class="nav-item"
          active-class="nav-item-active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </template>
    </nav>

    <!-- User Info -->
    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-info">
        <div class="user-name">{{ auth.user?.first_name || auth.user?.username }}</div>
        <div class="user-role badge">{{ roleLabel }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'

const auth = useAuthStore()
const { t } = useI18n()

const userInitials = computed(() => {
  const name = auth.user?.first_name || auth.user?.username || '?'
  return name.charAt(0).toUpperCase()
})

const roleLabel = computed(() => ({
  OWNER:          t('common.ownerRole'),
  BRANCH_MANAGER: t('common.managerRole'),
  CASHIER:        t('common.cashierRole'),
})[auth.role] || auth.role)

const ownerNav = [
  {
    label: 'nav.system',
    items: [
      { to: '/owner/dashboard', icon: '', label: 'nav.dashboard', id: 'owner-dashboard' },
      { to: '/owner/branches',  icon: '', label: 'nav.branches',  id: 'owner-branches'  },
      { to: '/owner/reports',   icon: '', label: 'nav.reports',   id: 'owner-reports'   },
      { to: '/owner/users',     icon: '', label: 'nav.users',     id: 'owner-users'     },
    ]
  }
]

const branchNav = [
  {
    label: 'nav.branch',
    items: [
      { to: '/branch/dashboard', icon: '', label: 'nav.dashboard', id: 'branch-dashboard' },
      { to: '/branch/sales',     icon: '', label: 'nav.sales',     id: 'branch-sales'     },
      { to: '/branch/inventory', icon: '', label: 'nav.inventory', id: 'branch-inventory' },
      { to: '/branch/products',  icon: '', label: 'nav.products',  id: 'branch-products'  },
      { to: '/branch/customers', icon: '', label: 'nav.customers', id: 'branch-customers' },
      { to: '/branch/suppliers', icon: '', label: 'nav.suppliers', id: 'branch-suppliers' },
    ]
  }
]

const filteredNavGroups = computed(() => {
  const rawNav = auth.role === 'OWNER' ? ownerNav : branchNav
  return rawNav.map(group => ({
    label: t(group.label),
    items: group.items.map(item => ({
      ...item,
      label: t(item.label)
    }))
  }))
})
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: #1b253b; /* Dark navy */
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0; top: 0;
  z-index: 100;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.logo-icon { font-size: 1.4rem; }
.logo-text  { font-size: 1.1rem; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }

.sidebar-nav { flex: 1; padding: 1.25rem .75rem; display: flex; flex-direction: column; gap: .2rem; }

.nav-group-label {
  font-size: .7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: .75rem .5rem .25rem;
}
html[dir="ltr"] .nav-group-label {
  text-align: left;
}
html[dir="rtl"] .nav-group-label {
  text-align: right;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem .75rem;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: .88rem;
  font-weight: 500;
  transition: all var(--transition);
  text-decoration: none;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #ffffff; }
.nav-item-active { 
  background: linear-gradient(45deg, #fe5d70, #fe9365) !important; 
  color: #ffffff !important; 
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(254, 93, 112, 0.2);
}
.nav-icon  { font-size: 1.1rem; width: 20px; text-align: center; }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: #151d2f;
}
.user-avatar {
  width: 36px; height: 36px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .95rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.user-name { font-size: .85rem; font-weight: 600; color: #ffffff; }
.user-role { 
  font-size: .7rem; 
  margin-top: .2rem; 
  color: #fe9365; 
  background: rgba(254, 147, 101, 0.15); 
  padding: 0.1rem 0.5rem;
}
</style>
