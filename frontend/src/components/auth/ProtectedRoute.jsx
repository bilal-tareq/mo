import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { getDefaultRoute } from '@/App'

export default function ProtectedRoute({ roles, children }) {
  const accessToken = useAuthStore(s => s.accessToken)
  const role = useAuthStore(s => s.user?.role)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />
  }

  return children
}
