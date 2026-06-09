import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },

  // Owner routes
  {
    path: '/owner',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { roles: ['OWNER'] },
    children: [
      { path: '',          redirect: '/owner/dashboard' },
      { path: 'dashboard', name: 'owner-dashboard', component: () => import('@/views/owner/OwnerDashboard.vue') },
      { path: 'branches',  name: 'owner-branches',  component: () => import('@/views/owner/BranchesView.vue') },
      { path: 'reports',   name: 'owner-reports',   component: () => import('@/views/owner/ReportsView.vue') },
      { path: 'users',     name: 'owner-users',     component: () => import('@/views/owner/UsersView.vue') },
    ],
  },

  // Branch Manager routes
  {
    path: '/branch',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { roles: ['OWNER', 'BRANCH_MANAGER', 'CASHIER'] },
    children: [
      { path: '',            redirect: '/branch/dashboard' },
      { path: 'dashboard',   name: 'branch-dashboard',  component: () => import('@/views/branch/BranchDashboard.vue') },
      { path: 'inventory',   name: 'branch-inventory',  component: () => import('@/views/branch/InventoryView.vue') },
      { path: 'products',    name: 'branch-products',   component: () => import('@/views/branch/ProductsView.vue') },
      { path: 'customers',   name: 'branch-customers',  component: () => import('@/views/branch/CustomersView.vue') },
      { path: 'suppliers',   name: 'branch-suppliers',  component: () => import('@/views/branch/SuppliersView.vue') },
      { path: 'sales',       name: 'branch-sales',      component: () => import('@/views/branch/SalesView.vue') },
    ],
  },

  // Catch all
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/shared/NotFoundView.vue') },
  { path: '/', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.public) return next()

  if (!auth.isAuthenticated) return next('/login')

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    // Redirect to correct home
    if (auth.role === 'OWNER')          return next('/owner/dashboard')
    if (auth.role === 'BRANCH_MANAGER') return next('/branch/dashboard')
    if (auth.role === 'CASHIER')        return next('/branch/dashboard')
    return next('/login')
  }

  next()
})

// Redirect root after login based on role
export function getDefaultRoute(role) {
  if (role === 'OWNER')          return '/owner/dashboard'
  if (role === 'BRANCH_MANAGER') return '/branch/dashboard'
  if (role === 'CASHIER')        return '/branch/dashboard'
  return '/login'
}

export default router
