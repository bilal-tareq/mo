import { useState, useEffect } from 'react'
import { reportsApi } from '@/api/reports'
import BaseCard from '@/components/ui/BaseCard'
import BaseButton from '@/components/ui/BaseButton'
import BaseTable from '@/components/ui/BaseTable'
import BaseChart from '@/components/ui/BaseChart'

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const [topProducts, setTopProducts] = useState([])
  const [trendChart, setTrendChart] = useState({ labels: [], datasets: [] })
  const [branchChart, setBranchChart] = useState({ labels: [], datasets: [] })

  const topCols = [
    { key: 'variant__product__name', label: 'المنتج' },
    { key: 'units_sold', label: 'الوحدات المباعة' },
    { key: 'revenue', label: 'الإيراد' },
  ]

  async function loadReports() {
    setLoading(true)
    try {
      const [trend, branch, top] = await Promise.all([
        reportsApi.salesTrend({ period }),
        reportsApi.branchComparison({ month: selectedMonth }),
        reportsApi.topProducts({ limit: 10 }),
      ])

      setTrendChart({
        labels: trend.data.map(d => d.period),
        datasets: [{ label: 'المبيعات', data: trend.data.map(d => d.revenue), borderColor: '#7c6aff', backgroundColor: 'rgba(124,106,255,.1)', fill: true, tension: .4 }]
      })

      setBranchChart({
        labels: branch.data.map(d => d.branch__name),
        datasets: [{ label: 'الإيراد', data: branch.data.map(d => d.revenue), backgroundColor: ['#7c6aff', '#ff6a9d', '#22d07a', '#f5a623', '#38c7ff'], borderRadius: 6 }]
      })

      setTopProducts(top.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadReports() }, [])

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>التقارير والإحصائيات</h1>

      <BaseCard>
        <div className="filters">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">الفترة</label>
            <select value={period} onChange={e => setPeriod(e.target.value)} className="form-select">
              <option value="daily">يومي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">الشهر</label>
            <input value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} type="month" className="form-input" />
          </div>
          <BaseButton onClick={loadReports} loading={loading}>تحديث</BaseButton>
        </div>
      </BaseCard>

      <div className="grid-2" style={{ margin: '1.5rem 0' }}>
        <BaseCard title="اتجاه المبيعات">
          <div style={{ height: 250 }}><BaseChart type="line" chartData={trendChart} /></div>
        </BaseCard>
        <BaseCard title="مقارنة الفروع">
          <div style={{ height: 250 }}><BaseChart type="bar" chartData={branchChart} /></div>
        </BaseCard>
      </div>

      <BaseCard title="أكثر المنتجات مبيعاً">
        <BaseTable columns={topCols} rows={topProducts} loading={loading}
          renderCell={{ revenue: ({ value }) => <>{Number(value).toLocaleString('ar-EG')} ج.م</> }}
        />
      </BaseCard>
    </div>
  )
}
