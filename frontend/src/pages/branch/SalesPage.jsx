import { useState, useEffect } from 'react'
import { salesApi } from '@/api/sales'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseModal from '@/components/ui/BaseModal'

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const cols = [
    { key: 'id', label: '#' },
    { key: 'customer_name', label: 'العميل' },
    { key: 'sold_by_name', label: 'البائع' },
    { key: 'total', label: 'الإجمالي' },
    { key: 'status', label: 'الحالة' },
    { key: 'created_at', label: 'التاريخ' },
  ]

  const itemCols = [
    { key: 'variant_name', label: 'المنتج' },
    { key: 'quantity', label: 'الكمية' },
    { key: 'unit_price', label: 'سعر الوحدة' },
    { key: 'total_price', label: 'الإجمالي' },
  ]

  const statusLabel = s => ({ COMPLETED: 'مكتمل', PENDING: 'معلق', REFUNDED: 'مسترجع', CANCELLED: 'ملغي' })[s] || s
  const statusClass = s => ({ COMPLETED: 'badge-success', PENDING: 'badge-warning', REFUNDED: 'badge-info', CANCELLED: 'badge-danger' })[s] || ''

  async function load() {
    setLoading(true)
    const params = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    try {
      const { data } = await salesApi.list(params)
      setSales(data.results || data)
    } finally {
      setLoading(false)
    }
  }

  async function viewSale(row) {
    const { data } = await salesApi.get(row.id)
    setSelectedSale(data)
    setDetailModal(true)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header">
        <h1>سجل المبيعات</h1>
        <div className="filters">
          <input value={dateFrom} onChange={e => setDateFrom(e.target.value)} type="date" className="form-input" style={{ width: 150 }} />
          <input value={dateTo} onChange={e => setDateTo(e.target.value)} type="date" className="form-input" style={{ width: 150 }} />
          <BaseButton onClick={load} loading={loading}>بحث</BaseButton>
        </div>
      </div>

      <BaseTable
        columns={cols}
        rows={sales}
        loading={loading}
        renderCell={{
          total: ({ value }) => <>{Number(value).toLocaleString('ar-EG')} ج.م</>,
          status: ({ value }) => <span className={`badge ${statusClass(value)}`}>{statusLabel(value)}</span>,
          created_at: ({ value }) => new Date(value).toLocaleDateString('ar-EG'),
        }}
        renderActions={({ row }) => (
          <BaseButton size="sm" variant="secondary" onClick={() => viewSale(row)}>عرض</BaseButton>
        )}
      />

      <BaseModal open={detailModal} onClose={() => setDetailModal(false)} title="تفاصيل الفاتورة" size="lg">
        {selectedSale && (
          <div>
            <div className="sale-meta">
              <div><strong>العميل:</strong> {selectedSale.customer_name || 'عميل زائر'}</div>
              <div><strong>البائع:</strong> {selectedSale.sold_by_name}</div>
              <div><strong>التاريخ:</strong> {new Date(selectedSale.created_at).toLocaleString('ar-EG')}</div>
            </div>
            <BaseTable
              columns={itemCols}
              rows={selectedSale.items}
              renderCell={{
                unit_price: ({ value }) => Number(value).toLocaleString('ar-EG'),
                total_price: ({ value }) => Number(value).toLocaleString('ar-EG'),
              }}
            />
            <div className="sale-totals">
              <div>المجموع الفرعي: <strong>{selectedSale.subtotal} ج.م</strong></div>
              <div>الخصم: <strong>{selectedSale.discount} ج.م</strong></div>
              <div>الضريبة: <strong>{selectedSale.tax} ج.م</strong></div>
              <div className="grand-total">الإجمالي: <strong>{selectedSale.total} ج.م</strong></div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  )
}
