import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form)
    } catch (e) {
      setError(e.response?.data?.detail || 'اسم المستخدم أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="logo-emoji"></span>
          <h1 className="logo-name">Fashion Chain</h1>
          <p className="logo-sub">نظام إدارة سلسلة المتاجر</p>
        </div>

        {/* Form */}
        <form id="login-form" onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">اسم المستخدم</label>
            <input
              id="login-username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              type="text"
              className="form-input"
              placeholder="أدخل اسم المستخدم"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">كلمة المرور</label>
            <input
              id="login-password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              type={showPass ? 'text' : 'password'}
              className="form-input"
              placeholder="أدخل كلمة المرور"
              required
              autoComplete="current-password"
            />
            <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            id="login-submit"
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : <span>تسجيل الدخول</span>}
          </button>
        </form>
      </div>
    </div>
  )
}
