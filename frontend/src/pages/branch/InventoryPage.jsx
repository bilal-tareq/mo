import { useState, useEffect, useMemo } from 'react'
import { inventoryApi } from '@/api/inventory'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseModal from '@/components/ui/BaseModal'

export default function InventoryPage() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [adjustModal, setAdjustModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [adjForm, setAdjForm] = useState({ movement_type: 'IN', quantity: 1, note: '' })

  const cols = [
    { key: 'branch_name', label: 'الفرع' },
    { key: 'variant_name', label: 'المنتج / الصنف' },
    { key: 'quantity', label: 'الكمية' },
    { key: 'min_quantity', label: 'الحد الأدنى' },
    { key: 'is_low_stock', label: 'الحالة' },
  ]

  const filteredStock = useMemo(() => {
    let s = stock
    if (search) s = s.filter(i => i.variant_name.toLowerCase().includes(search.toLowerCase()))
    if (lowStockFilter === 'true') s = s.filter(i => i.is_low_stock)
    return s
  }, [stock, search, lowStockFilter])

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (lowStockFilter) params.low_stock = lowStockFilter
      const { data } = await inventoryApi.listStock(params)
      setStock(data.results || data)
    } finally { setLoading(false) }
  }

  function openAdjust(row) {
    setSelected(row)
    setErrorMessage('')
    setAdjForm({ movement_type: 'IN', quantity: 1, note: '' })
    setAdjustModal(true)
  }

  async function saveAdjust() {
    setSaving(true)
    setErrorMessage('')
    try {
      await inventoryApi.createMovement({ stock: selected.id, ...adjForm })
      setAdjustModal(false)
      await load()
      setSelected(null)
    } catch (error) {
      console.error(error)
      if (error.response?.data) {
        const data = error.response.data
        if (typeof data === 'object') {
          setErrorMessage(Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join(' | '))
        } else {
          setErrorMessage(String(data))
        }
      } else {
        setErrorMessage('حدث خطأ أثناء حفظ البيانات.')
      }
    } finally { setSaving(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header">
        <h1>إدارة المخزون</h1>
        <div className="filters">
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" className="form-input" placeholder="بحث..." style={{ width: 200 }} />
          <select value={lowStockFilter} onChange={e => setLowStockFilter(e.target.value)} className="form-select" style={{ width: 160 }}>
            <option value="">جميع المنتجات</option>
            <option value="true">منخفض المخزون فقط</option>
          </select>
          <BaseButton onClick={load} loading={loading}>تحديث</BaseButton>
        </div>
      </div>

      <BaseTable
        columns={cols}
        rows={filteredStock}
        loading={loading}
        renderCell={{
          quantity: ({ row }) => <span className={`badge ${row.is_low_stock ? 'badge-danger' : 'badge-success'}`}>{row.quantity}</span>,
          is_low_stock: ({ value }) => value ? <span className="badge badge-warning">منخفض</span> : <span className="badge badge-success">كافي</span>,
        }}
        renderActions={({ row }) => (
          <BaseButton size="sm" variant="secondary" onClick={() => openAdjust(row)}>تعديل</BaseButton>
        )}
      />

      <BaseModal
        open={adjustModal}
        onClose={() => setAdjustModal(false)}
        title="تعديل المخزون"
        footer={<>
          <BaseButton variant="secondary" onClick={() => setAdjustModal(false)}>إلغاء</BaseButton>
          <BaseButton loading={saving} onClick={saveAdjust}>حفظ</BaseButton>
        </>}
      >
        {errorMessage && (
          <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 77, 106, 0.1)', border: '1px solid rgba(255, 77, 106, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}
        {selected && (
          <div>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>{selected.variant_name}</p>
            <div className="form-group">
              <label className="form-label">نوع الحركة</label>
              <select value={adjForm.movement_type} onChange={e => setAdjForm({ ...adjForm, movement_type: e.target.value })} className="form-select">
                <option value="IN">إدخل مخزون</option>
                <option value="OUT">إخراج مخزون</option>
                <option value="ADJUSTMENT">تعديل</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">الكمية</label>
              <input value={adjForm.quantity} onChange={e => setAdjForm({ ...adjForm, quantity: Number(e.target.value) })} type="number" className="form-input" min="1" required />
            </div>
            <div className="form-group">
              <label className="form-label">ملاحظة</label>
              <textarea value={adjForm.note} onChange={e => setAdjForm({ ...adjForm, note: e.target.value })} className="form-textarea" />
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  )
}
