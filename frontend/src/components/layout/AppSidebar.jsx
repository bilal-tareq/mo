import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/hooks/useI18n'
import './AppSidebar.css'

export default function AppSidebar() {
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.user?.role)
  const { t } = useI18n()

  const userInitials = useMemo(() => {
    const name = user?.first_name || user?.username || '?'
    return name.charAt(0).toUpperCase()
  }, [user])
  const roleLabel = useMemo(() => ({
    OWNER:          t('common.ownerRole'),
    BRANCH_MANAGER: t('common.managerRole'),
  })[role] || role, [role, t])
  const ownerNav = [
    {
      label: 'nav.system',
      items: [
        { to: '/owner/dashboard', icon: '', label: 'nav.dashboard', id: 'owner-dashboard' },
        { to: '/owner/branches',  icon: '', label: 'nav.branches',  id: 'owner-branches'  },
        { to: '/owner/reports',   icon: '', label: 'nav.reports',   id: 'owner-reports'   },
        { to: '/owner/users',     icon: '', label: 'nav.users',     id: 'owner-users'     },
        { to: '/branch/powerbi',  icon: '📊', label: 'nav.powerbi',  id: 'owner-powerbi'   },
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
        { to: '/branch/powerbi',   icon: '📊', label: 'nav.powerbi',  id: 'branch-powerbi'   },
      ]
    }
  ]

  const filteredNavGroups = useMemo(() => {
    const rawNav = role === 'OWNER' ? ownerNav : branchNav
    return rawNav.map(group => ({
      label: t(group.label),
      items: group.items.map(item => ({
        ...item,
        label: t(item.label)
      }))
    }))
  }, [role, t])

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-icon"></span>
        <span className="logo-text">Fashion Chain</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {filteredNavGroups.map(group => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-${item.id}`}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' nav-item-active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="user-avatar">{userInitials}</div>
        <div className="user-info">
          <div className="user-name">{user?.first_name || user?.username}</div>
          <div className="user-role badge">{roleLabel}</div>
        </div>
      </div>
    </aside>
  )
}
