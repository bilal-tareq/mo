import { useState, useEffect } from 'react'
import { authApi } from '@/api/auth'
import { branchesApi } from '@/api/branches'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseModal from '@/components/ui/BaseModal'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', email: '', password: '', role: 'BRANCH_MANAGER', branch: null })

  const cols = [
    { key: 'username', label: 'المستخدم' },
    { key: 'first_name', label: 'الاسم' },
    { key: 'role', label: 'الدور' },
    { key: 'branch_name', label: 'الفرع' },
    { key: 'is_active', label: 'الحالة' },
  ]

  const roleLabel = r => ({ OWNER: 'المالك', BRANCH_MANAGER: 'مدير فرع' })[r] || r
  const roleClass = r => ({ OWNER: 'badge-accent', BRANCH_MANAGER: 'badge-info' })[r] || ''

  async function load() {
    setLoading(true)
    try {
      const { data } = await authApi.listUsers(); setUsers(data.results || data)
      const { data: bData } = await branchesApi.list(); setBranches(bData.results || bData)
    } finally { setLoading(false) }
  }

  function openAddModal() { setEditingUser(null); setErrorMessage(''); setForm({ username: '', first_name: '', last_name: '', email: '', password: '', role: 'BRANCH_MANAGER', branch: null }); setOpenModal(true) }
  function editUser(u) { setEditingUser(u); setErrorMessage(''); setForm({ ...u, password: '' }); setOpenModal(true) }

  async function saveUser() {
    setSaving(true); setErrorMessage('')
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (payload.role === 'OWNER') payload.branch = null
      if (editingUser) { await authApi.updateUser(editingUser.id, payload) } else { await authApi.createUser(payload) }
      setOpenModal(false); await load(); setEditingUser(null); setForm({ username: '', first_name: '', last_name: '', email: '', password: '', role: 'BRANCH_MANAGER', branch: null })
    } catch (error) {
      console.error(error)
      if (error.response?.data) { const data = error.response.data; if (typeof data === 'object') { setErrorMessage(Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join(' | ')) } else { setErrorMessage(String(data)) } }
      else { setErrorMessage('حدث خطأ أثناء حفظ البيانات.') }
    } finally { setSaving(false) }
  }

  async function deleteUser(u) { if (confirm(`حذف "${u.username}"؟`)) { await authApi.deleteUser(u.id); await load() } }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header"><h1>المستخدمون</h1><BaseButton id="btn-add-user" onClick={openAddModal}>إضافة مستخدم</BaseButton></div>

      <BaseTable columns={cols} rows={users} loading={loading}
        renderCell={{
          role: ({ value }) => <span className={`badge ${roleClass(value)}`}>{roleLabel(value)}</span>,
          is_active: ({ value }) => <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>{value ? 'نشط' : 'غير نشط'}</span>,
        }}
        renderActions={({ row }) => (
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <BaseButton size="sm" variant="secondary" onClick={() => editUser(row)}>تعديل</BaseButton>
            <BaseButton size="sm" variant="danger" onClick={() => deleteUser(row)}>حذف</BaseButton>
          </div>
        )}
      />

      <BaseModal open={openModal} onClose={() => setOpenModal(false)} title={editingUser ? 'تعديل مستخدم' : 'مستخدم جديد'}
        footer={<><BaseButton variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</BaseButton><BaseButton loading={saving} onClick={saveUser}>حفظ</BaseButton></>}>
        {errorMessage && <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMessage}</div>}
        <div className="form-group"><label className="form-label">اسم المستخدم *</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">الاسم الأول</label><input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="form-input" /></div>
        <div className="form-group"><label className="form-label">الاسم الأخير</label><input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="form-input" /></div>
        <div className="form-group"><label className="form-label">البريد الإلكتروني</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="form-input" type="email" /></div>
        {!editingUser && <div className="form-group"><label className="form-label">كلمة المرور *</label><input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="form-input" type="password" required /></div>}
        <div className="form-group">
          <label className="form-label">الدور</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="form-select">
            <option value="BRANCH_MANAGER">مدير فرع</option>
          </select>
        </div>
        {form.role !== 'OWNER' && (
          <div className="form-group">
            <label className="form-label">الفرع *</label>
            <select value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value || null })} className="form-select" required>
              <option value="">اختر الفرع</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
      </BaseModal>
    </div>
  )
}
