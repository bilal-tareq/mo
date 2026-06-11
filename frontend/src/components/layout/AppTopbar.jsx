import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import './AppTopbar.css'

export default function AppTopbar() {
  const location = useLocation()
  const { logout } = useAuth()
  const { t, locale, setLocale } = useI18n()

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
      'sales':      'nav.sales',
      'powerbi':    'nav.powerbi',
    }
    const key = mapping[routeName]
    return key ? t(key) : routeName
  }, [routeName, t])

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

        {/* Logout */}
        <button className="logout-btn" id="topbar-logout" onClick={logout}>
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </header>
  )
}
