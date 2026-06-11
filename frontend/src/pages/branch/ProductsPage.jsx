import { useState, useEffect, useRef } from 'react'
import { productsApi } from '@/api/products'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseModal from '@/components/ui/BaseModal'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ name: '', category: null, description: '', is_active: true })
  const debounceRef = useRef(null)

  const cols = [
    { key: 'image', label: 'صورة' },
    { key: 'name', label: 'الاسم' },
    { key: 'category_name', label: 'التصنيف' },
    { key: 'is_active', label: 'الحالة' },
  ]

  function debouncedLoad(val) {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(val), 400)
  }

  async function load(s) {
    setLoading(true)
    try {
      const { data } = await productsApi.list({ search: s ?? search })
      setProducts(data.results || data)
    } finally { setLoading(false) }
  }

  async function loadCategories() {
    const { data } = await productsApi.listCategories()
    setCategories(data.results || data)
  }

  function openAddModal() {
    setEditing(null); setErrorMessage(''); setForm({ name: '', category: null, description: '', is_active: true }); setOpenModal(true)
  }

  function edit(p) {
    setEditing(p); setErrorMessage(''); setForm({ ...p }); setOpenModal(true)
  }

  async function save() {
    setSaving(true); setErrorMessage('')
    try {
      if (editing) { await productsApi.update(editing.id, form) }
      else { await productsApi.create(form) }
      setOpenModal(false); await load(); setEditing(null); setForm({ name: '', category: null, description: '', is_active: true })
    } catch (error) {
      console.error(error)
      if (error.response?.data) {
        const data = error.response.data
        if (typeof data === 'object') { setErrorMessage(Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join(' | ')) }
        else { setErrorMessage(String(data)) }
      } else { setErrorMessage('حدث خطأ أثناء حفظ البيانات.') }
    } finally { setSaving(false) }
  }

  async function del(p) {
    if (confirm(`حذف "${p.name}"؟`)) { await productsApi.delete(p.id); await load() }
  }

  useEffect(() => { load(); loadCategories() }, [])

  return (
    <div>
      <div className="page-header">
        <h1>المنتجات</h1>
        <BaseButton id="btn-add-product" onClick={openAddModal}>إضافة منتج</BaseButton>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input value={search} onChange={e => debouncedLoad(e.target.value)} className="form-input" placeholder="ابحث بالاسم أو SKU أو الباركود..." style={{ maxWidth: 360 }} />
      </div>

      <BaseTable columns={cols} rows={products} loading={loading}
        renderCell={{
          is_active: ({ value }) => <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>{value ? 'نشط' : 'معطل'}</span>,
          image: ({ value }) => value ? <img src={value} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} /> : '—',
        }}
        renderActions={({ row }) => (
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <BaseButton size="sm" variant="secondary" onClick={() => edit(row)}>تعديل</BaseButton>
            <BaseButton size="sm" variant="danger" onClick={() => del(row)}>حذف</BaseButton>
          </div>
        )}
      />

      <BaseModal open={openModal} onClose={() => setOpenModal(false)} title={editing ? 'تعديل منتج' : 'منتج جديد'}
        footer={<><BaseButton variant="secondary" onClick={() => setOpenModal(false)}>إلغاء</BaseButton><BaseButton loading={saving} onClick={save}>حفظ</BaseButton></>}>
        {errorMessage && <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMessage}</div>}
        <div className="form-group"><label className="form-label">الاسم *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="form-input" required /></div>
        <div className="form-group">
          <label className="form-label">التصنيف</label>
          <select value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value || null })} className="form-select">
            <option value="">— بدون تصنيف —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">الوصف</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-textarea" /></div>
        <div className="form-group">
          <label className="form-label">الحالة</label>
          <select value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })} className="form-select">
            <option value="true">نشط</option>
            <option value="false">معطل</option>
          </select>
        </div>
      </BaseModal>
    </div>
  )
}
