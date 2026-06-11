import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/shared/NotFoundPage'

// Owner pages
import OwnerDashboard from '@/pages/owner/OwnerDashboard'
import BranchesPage from '@/pages/owner/BranchesPage'
import ReportsPage from '@/pages/owner/ReportsPage'
import UsersPage from '@/pages/owner/UsersPage'

// Branch pages
import BranchDashboard from '@/pages/branch/BranchDashboard'
import SalesPage from '@/pages/branch/SalesPage'
import InventoryPage from '@/pages/branch/InventoryPage'
import ProductsPage from '@/pages/branch/ProductsPage'
import CustomersPage from '@/pages/branch/CustomersPage'
import PowerBIDashboardPage from '@/pages/branch/PowerBIDashboardPage'

export function getDefaultRoute(role) {
  switch (role) {
    case 'OWNER': return '/owner/dashboard'
    case 'BRANCH_MANAGER':
    default: return '/branch/dashboard'
  }
}

function RootRedirect() {
  const role = useAuthStore(s => s.user?.role)
  const token = useAuthStore(s => s.accessToken)
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={getDefaultRoute(role)} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Owner Routes */}
        <Route element={<ProtectedRoute roles={['OWNER']}><AppLayout /></ProtectedRoute>}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/branches" element={<BranchesPage />} />
          <Route path="/owner/reports" element={<ReportsPage />} />
          <Route path="/owner/users" element={<UsersPage />} />
        </Route>

        {/* Branch Routes */}
        <Route element={<ProtectedRoute roles={['OWNER', 'BRANCH_MANAGER']}><AppLayout /></ProtectedRoute>}>
          <Route path="/branch/dashboard" element={<BranchDashboard />} />
          <Route path="/branch/sales" element={<SalesPage />} />
          <Route path="/branch/inventory" element={<InventoryPage />} />
          <Route path="/branch/products" element={<ProductsPage />} />
          <Route path="/branch/customers" element={<CustomersPage />} />
          <Route path="/branch/powerbi" element={<PowerBIDashboardPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
