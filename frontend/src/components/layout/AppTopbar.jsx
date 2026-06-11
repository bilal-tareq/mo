import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import './AppTopbar.css'

export default function AppTopbar() {
  const location = useLocation()
  const notifications = useNotificationsStore(s => s.notifications)
  const unreadCount = useNotificationsStore(s => s.notifications.filter(n => !n.is_read).length)
  const fetchNotifications = useNotificationsStore(s => s.fetchNotifications)
  const markAllRead = useNotificationsStore(s => s.markAllRead)
  const markOneRead = useNotificationsStore(s => s.markOneRead)
  const { logout } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const [showNotif, setShowNotif] = useState(false)

  const routeName = location.pathname.split('/').filter(Boolean).pop() || ''

  const translatedTitle = useMemo(() => {
    const mapping = {
      'dashboard':  'nav.dashboard',
      'branches':   'nav.branches',
      'reports':    'nav.reports',
      'users':      'nav.users',
      'inventory':  'nav.inventory',
      'products':   'nav.products',
      'customers':  'nav.customers',
      'suppliers':  'nav.suppliers',
      'sales':      'nav.sales',
      'powerbi':    'nav.powerbi',
    }
    const key = mapping[routeName]
    return key ? t(key) : routeName
  }, [routeName, t])

  function toggleNotif() {
    setShowNotif(prev => !prev)
    if (!showNotif) fetchNotifications()
  }

  function toggleLang() {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }

  return (
    <header className="topbar">
      <div className="topbar-start">
        <h2 className="page-title">{translatedTitle}</h2>
      </div>
      <div className="topbar-end">
        {/* Language Switcher */}
        <button className="lang-btn" onClick={toggleLang} id="topbar-lang-toggle">
          <span className="lang-icon">🌐</span>
          <span className="lang-text">{locale === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Notifications */}
        <div className="notif-btn" onClick={toggleNotif} id="topbar-notifications">
          <span className="notif-icon">🔔</span>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </div>

        {/* Notification Dropdown */}
        {showNotif && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <span>{t('common.notifications')}</span>
              <button onClick={() => markAllRead()}>{t('common.readAll')}</button>
            </div>
            <div className="notif-list">
              {notifications.slice(0, 8).map(n => (
                <div
                  key={n.id}
                  className={`notif-item${!n.is_read ? ' unread' : ''}`}
                  onClick={() => markOneRead(n.id)}
                >
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                </div>
              ))}
              {!notifications.length && (
                <div className="notif-empty">{t('common.noNotifs')}</div>
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <button className="logout-btn" id="topbar-logout" onClick={logout}>
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </header>
  )
}
