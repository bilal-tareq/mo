import { create } from 'zustand'
import { authApi } from '@/api/auth'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,

  // Derived
  get isAuthenticated() { return !!get().accessToken },
  get role() { return get().user?.role || null },
  get isOwner() { return get().role === 'OWNER' },
  get isBranchManager() { return ['OWNER', 'BRANCH_MANAGER'].includes(get().role) },

  login: async (credentials) => {
    const { data } = await authApi.login(credentials)
    set({
      accessToken: data.access,
      refreshToken: data.refresh,
      user: data.user,
    })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  logout: async () => {
    try {
      await authApi.logout({ refresh: get().refreshToken })
    } catch { /* ignore */ }
    set({ accessToken: null, refreshToken: null, user: null })
    localStorage.clear()
  },

  fetchProfile: async () => {
    const { data } = await authApi.getProfile()
    set({ user: data })
    localStorage.setItem('user', JSON.stringify(data))
  },
}))
