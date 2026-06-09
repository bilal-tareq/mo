import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { getDefaultRoute } from '@/router/index'

export function useAuth() {
  const store  = useAuthStore()
  const router = useRouter()

  async function login(credentials) {
    await store.login(credentials)
    router.push(getDefaultRoute(store.role))
  }

  async function logout() {
    await store.logout()
    router.push('/login')
  }

  return { store, login, logout }
}
