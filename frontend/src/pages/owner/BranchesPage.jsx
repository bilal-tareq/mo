import { useState, useEffect } from 'react'
import { branchesApi } from '@/api/branches'
import BaseButton from '@/components/ui/BaseButton'
import BaseModal from '@/components/ui/BaseModal'

export default function BranchesPage() {
  const [branches, setBranches] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })

  async function load() {
    const { data } = await branchesApi.list()
    setBranches(data.results || data)
  }

  function openAddModal() { setEditingBranch(null); setErrorMessage(''); setForm({ name: '', address: '', phone: '', email: '' }); setOpenModal(true) }
  function editBranch(b) { setEditingBranch(b); setErrorMessage(''); setForm({ name: b.name, address: b.address, phone: b.phone, email: b.email }); setOpenModal(true) }

  async function saveBranch() {
    setSaving(true); setErrorMessage('')
    try {
      if (editingBranch) { await branchesApi.update(editingBranch.id, form) } else { await branchesApi.create(form) }
      setOpenModal(false); await load(); setEditingBranch(null); setForm({ name: '', address: '', phone: '', email: '' })
    } catch (error) {
      console.error(error)
      if (error.response?.data) { const data = error.response.data; if (typeof data === 'object') { setErrorMessage(Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join(' | ')) } else { setErrorMessage(String(data)) } }
      else { setErrorMessage('حدث خطأ أثناء حفظ البيانات.') }
    } finally { setSaving(false) }
  }

  async function confirmDelete(b) { if (confirm(`حذف فرع "${b.name}"؟`)) { await branchesApi.delete(b.id); await load() } }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header">
        <h1>إدارة الفروع</h1>
        <BaseButton id="btn-add-branch" onClick={openAddModal}>إضافة فرع</BaseButton>
      </div>

      <div className="grid-3" style={{ marginTop: '1.5rem' }}>
        {branches.map(branch => (
          <div key={branch.id} className={`branch-card${!branch.is_active ? ' inactive' : ''}`}>
            <div className="branch-card-header">
              <span className="branch-icon">🏪</span>
              <div>
                <div className="branch-name">{branch.name}</div>
                <span className={`badge ${branch.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {branch.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="branch-info">
              {branch.phone && <div> {branch.phone}</div>}
              {branch.address && <div> {branch.address}</div>}
              <div>{branch.staff_count} موظف</div>
              {branch.settings && <div> ضريبة {branch.settings.tax_rate}%</div>}
            </div>
            <div className="branch-actions">
              <BaseButton variant="secondary" size="sm" onClick={() => editBranch(branch)}>تعديل</BaseButton>
              <BaseButton variant="danger" size="sm" onClick={() => confirmDelete(branch)}>حذف</BaseButton>
            </div>
          </div>
        ))}
      </div>

      <BaseModal open={openModal} onClose={() => setOpenModal(false)} title={editingBranch ? 'تعديل فرع' : 'إضافة فرع جديد'}
        footer={<><BaseButton variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</BaseButton><BaseButton loading={saving} onClick={saveBranch}>حفظ</BaseButton></>}>
        {errorMessage && <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMessage}</div>}
        <div className="form-group"><label className="form-label">اسم الفرع *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">العنوان</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="form-input" /></div>
        <div className="form-group"><label className="form-label">الهاتف</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="form-input" /></div>
        <div className="form-group"><label className="form-label">البريد الإلكتروني</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="form-input" type="email" /></div>
      </BaseModal>
    </div>
  )
}
