import { useState, useEffect, useRef } from 'react'
import { customersApi } from '@/api/customers'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseModal from '@/components/ui/BaseModal'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const timerRef = useRef(null)

  const cols = [
    { key: 'name', label: 'الاسم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'loyalty_points', label: 'نقاط الولاء' },
    { key: 'total_purchases', label: 'إجمالي المشتريات' },
  ]

  function debouncedLoad(val) { setSearch(val); clearTimeout(timerRef.current); timerRef.current = setTimeout(() => load(val), 400) }

  async function load(s) {
    setLoading(true)
    try { const { data } = await customersApi.list({ search: s ?? search }); setCustomers(data.results || data) }
    finally { setLoading(false) }
  }

  function openAddModal() { setEditing(null); setErrorMessage(''); setForm({ name: '', phone: '', email: '', notes: '' }); setOpenModal(true) }
  function edit(c) { setEditing(c); setErrorMessage(''); setForm({ ...c }); setOpenModal(true) }

  async function save() {
    setSaving(true); setErrorMessage('')
    try {
      if (editing) { await customersApi.update(editing.id, form) } else { await customersApi.create(form) }
      setOpenModal(false); await load(); setEditing(null); setForm({ name: '', phone: '', email: '', notes: '' })
    } catch (error) {
      console.error(error)
      if (error.response?.data) { const data = error.response.data; if (typeof data === 'object') { setErrorMessage(Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join(' | ')) } else { setErrorMessage(String(data)) } }
      else { setErrorMessage('حدث خطأ أثناء حفظ البيانات.') }
    } finally { setSaving(false) }
  }

  async function del(c) { if (confirm(`حذف "${c.name}"؟`)) { await customersApi.delete(c.id); await load() } }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header"><h1>العملاء</h1><BaseButton onClick={openAddModal}>إضافة عميل</BaseButton></div>
      <div style={{ marginBottom: '1rem' }}><input value={search} onChange={e => debouncedLoad(e.target.value)} className="form-input" placeholder="ابحث بالاسم أو رقم الهاتف..." style={{ maxWidth: 360 }} /></div>
      <BaseTable columns={cols} rows={customers} loading={loading}
        renderCell={{
          total_purchases: ({ value }) => <>{Number(value).toLocaleString('ar-EG')} ج.م</>,
          loyalty_points: ({ value }) => <span className="badge badge-accent">{value} نقطة</span>,
        }}
        renderActions={({ row }) => (
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <BaseButton size="sm" variant="secondary" onClick={() => edit(row)}>تعديل</BaseButton>
            <BaseButton size="sm" variant="danger" onClick={() => del(row)}>حذف</BaseButton>
          </div>
        )}
      />
      <BaseModal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'تعديل عميل' : 'عميل جديد'}
        footer={<><BaseButton variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</BaseButton><BaseButton loading={saving} onClick={save}>حفظ</BaseButton></>}>
        {errorMessage && <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMessage}</div>}
        <div className="form-group"><label className="form-label">الاسم *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">الهاتف *</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="form-input" required /></div>
        <div className="form-group"><label className="form-label">البريد الإلكتروني</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="form-input" type="email" /></div>
        <div className="form-group"><label className="form-label">ملاحظات</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="form-textarea" /></div>
      </BaseModal>
    </div>
  )
}
