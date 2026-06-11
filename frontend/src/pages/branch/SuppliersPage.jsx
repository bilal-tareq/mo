import { useState, useEffect } from 'react'
import { suppliersApi } from '@/api/suppliers'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseModal from '@/components/ui/BaseModal'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' })

  const cols = [
    { key: 'name', label: 'المورد' },
    { key: 'contact_person', label: 'المسؤول' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'email', label: 'البريد' },
    { key: 'is_active', label: 'الحالة' },
  ]

  async function load() {
    setLoading(true)
    try { const { data } = await suppliersApi.list(); setSuppliers(data.results || data) }
    finally { setLoading(false) }
  }

  function openAddModal() { setEditing(null); setErrorMessage(''); setForm({ name: '', contact_person: '', phone: '', email: '', address: '' }); setOpenModal(true) }
  function edit(s) { setEditing(s); setErrorMessage(''); setForm({ ...s }); setOpenModal(true) }

  async function save() {
    setSaving(true); setErrorMessage('')
    try {
      if (editing) { await suppliersApi.update(editing.id, form) } else { await suppliersApi.create(form) }
      setOpenModal(false); await load(); setEditing(null); setForm({ name: '', contact_person: '', phone: '', email: '', address: '' })
    } catch (error) {
      console.error(error)
      if (error.response?.data) { const data = error.response.data; if (typeof data === 'object') { setErrorMessage(Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join(' | ')) } else { setErrorMessage(String(data)) } }
      else { setErrorMessage('حدث خطأ أثناء حفظ البيانات.') }
    } finally { setSaving(false) }
  }

  async function del(s) { if (confirm(`حذف "${s.name}"؟`)) { await suppliersApi.delete(s.id); await load() } }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header"><h1>الموردون</h1><BaseButton onClick={openAddModal}>إضافة مورد</BaseButton></div>
      <BaseTable columns={cols} rows={suppliers} loading={loading}
        renderCell={{
          is_active: ({ value }) => <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>{value ? 'نشط' : 'غير نشط'}</span>,
        }}
        renderActions={({ row }) => (
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <BaseButton size="sm" variant="secondary" onClick={() => edit(row)}>تعديل</BaseButton>
            <BaseButton size="sm" variant="danger" onClick={() => del(row)}>حذف</BaseButton>
          </div>
        )}
      />
      <BaseModal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'تعديل مورد' : 'مورد جديد'}
        footer={<><BaseButton variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</BaseButton><BaseButton loading={saving} onClick={save}>حفظ</BaseButton></>}>
        {errorMessage && <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMessage}</div>}
        <div className="form-group"><label className="form-label">الاسم *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">المسؤول</label><input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} className="form-input" /></div>
        <div className="form-group"><label className="form-label">الهاتف</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="form-input" /></div>
        <div className="form-group"><label className="form-label">البريد</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="form-input" type="email" /></div>
        <div className="form-group"><label className="form-label">العنوان</label><textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="form-textarea" /></div>
      </BaseModal>
    </div>
  )
}
