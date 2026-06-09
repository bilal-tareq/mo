import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user         = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessToken  = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const role            = computed(() => user.value?.role || null)
  const isOwner         = computed(() => role.value === 'OWNER')
  const isBranchManager = computed(() => ['OWNER', 'BRANCH_MANAGER'].includes(role.value))

  async function login(credentials) {
    const { data } = await authApi.login(credentials)
    accessToken.value  = data.access
    refreshToken.value = data.refresh
    user.value         = data.user
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user',          JSON.stringify(data.user))
  }

  async function logout() {
    try {
      await authApi.logout({ refresh: refreshToken.value })
    } catch { /* ignore */ }
    accessToken.value  = null
    refreshToken.value = null
    user.value         = null
    localStorage.clear()
  }

  async function fetchProfile() {
    const { data } = await authApi.getProfile()
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  return { user, accessToken, refreshToken, isAuthenticated, role, isOwner, isBranchManager, login, logout, fetchProfile }
})
