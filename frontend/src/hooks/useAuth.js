import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { getDefaultRoute } from '@/App'

export function useAuth() {
  const store = useAuthStore()
  const navigate = useNavigate()

  const login = async (credentials) => {
    const data = await store.login(credentials)
    navigate(getDefaultRoute(data.user.role))
  }

  const logout = async () => {
    await store.logout()
    navigate('/login')
  }

  return { store, login, logout }
}
