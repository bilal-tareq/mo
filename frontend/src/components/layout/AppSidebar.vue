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
        <div class="user-role badge badge-accent">{{ roleLabel }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const userInitials = computed(() => {
  const name = auth.user?.first_name || auth.user?.username || '?'
  return name.charAt(0).toUpperCase()
})

const roleLabel = computed(() => ({
  OWNER:          'المالك',
  BRANCH_MANAGER: 'مدير فرع',
  CASHIER:        'كاشير',
})[auth.role] || auth.role)

const ownerNav = [
  {
    label: 'الرئيسية',
    items: [
      { to: '/owner/dashboard', icon: '', label: 'لوحة التحكم',   id: 'owner-dashboard' },
      { to: '/owner/branches',  icon: '', label: 'الفروع',          id: 'owner-branches'  },
      { to: '/owner/reports',   icon: '', label: 'التقارير',        id: 'owner-reports'   },
      { to: '/owner/users',     icon: '', label: 'المستخدمون',      id: 'owner-users'     },
    ]
  }
]

const branchNav = [
  {
    label: 'الفرع',
    items: [
      { to: '/branch/dashboard', icon: '', label: 'لوحة التحكم', id: 'branch-dashboard' },
      { to: '/branch/sales',     icon: '', label: 'المبيعات',     id: 'branch-sales'     },
      { to: '/branch/inventory', icon: '', label: 'المخزون',      id: 'branch-inventory' },
      { to: '/branch/products',  icon: '', label: 'المنتجات',     id: 'branch-products'  },
      { to: '/branch/customers', icon: '', label: 'العملاء',      id: 'branch-customers' },
      { to: '/branch/suppliers', icon: '', label: 'الموردين',     id: 'branch-suppliers' },
    ]
  }
]

const filteredNavGroups = computed(() =>
  auth.role === 'OWNER' ? ownerNav : branchNav
)
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
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
  border-bottom: 1px solid var(--color-border);
}
.logo-icon { font-size: 1.6rem; }
.logo-text  { font-size: 1rem; font-weight: 800; color: var(--color-accent); }

.sidebar-nav { flex: 1; padding: 1rem .75rem; display: flex; flex-direction: column; gap: .2rem; }

.nav-group-label {
  font-size: .7rem;
  font-weight: 700;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: .75rem .5rem .25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .6rem .75rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: .9rem;
  font-weight: 500;
  transition: all var(--transition);
  text-decoration: none;
}
.nav-item:hover { background: var(--color-surface-2); color: var(--color-text); }
.nav-item-active { background: var(--color-accent-soft) !important; color: var(--color-accent) !important; }
.nav-icon  { font-size: 1rem; width: 20px; text-align: center; }

.sidebar-user {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
}
.user-avatar {
  width: 36px; height: 36px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .95rem;
  flex-shrink: 0;
}
.user-name { font-size: .85rem; font-weight: 600; }
.user-role { font-size: .7rem; margin-top: .2rem; }
</style>
