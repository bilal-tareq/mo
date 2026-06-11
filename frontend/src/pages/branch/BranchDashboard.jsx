import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import { salesApi } from '@/api/sales'
import { useI18n } from '@/hooks/useI18n'
import MetricCard from '@/components/domain/MetricCard'
import StockAlert from '@/components/domain/StockAlert'
import BaseCard from '@/components/ui/BaseCard'
import BaseTable from '@/components/ui/BaseTable'

export default function BranchDashboard() {
  const user = useAuthStore(s => s.user)
  const { t, locale } = useI18n()

  const [summary, setSummary] = useState({ total_revenue: 0, total_sales: 0, avg_sale: 0 })
  const [lowStockItems, setLowStockItems] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)

  const salesCols = useMemo(() => [
    { key: 'id', label: t('dash.invoiceNo') },
    { key: 'customer_name', label: t('dash.customer') },
    { key: 'total', label: t('dash.total') },
    { key: 'status', label: t('dash.status') },
  ], [t])

  const statusClass = s => ({ COMPLETED: 'badge-success', PENDING: 'badge-warning', REFUNDED: 'badge-info', CANCELLED: 'badge-danger' })[s] || ''

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      try {
        const [daily, inv, sales] = await Promise.all([
          reportsApi.daily({ date: today }).catch(() => ({ data: { total_revenue: 0, total_sales: 0, avg_sale: 0 } })),
          reportsApi.inventory().catch(() => ({ data: { low_stock_items: [], low_stock_count: 0 } })),
          salesApi.list({ page_size: 6 }).catch(() => ({ data: { results: [] } })),
        ])
        setSummary(daily.data)
        setLowStockItems(inv.data.low_stock_items || [])
        setLowStockCount(inv.data.low_stock_count || 0)
        setRecentSales((sales.data.results || sales.data || []).slice(0, 6))
      } catch (error) {
        console.error('Failed to load branch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--color-text)' }}>{t('nav.branch')}</h1>
        <p className="text-muted">{t('dash.branchSubtitle')} {user?.branch_name || t('dash.cashCustomer')}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard label={t('dash.allEarnings')} value={summary.total_revenue || 0} type="orange" format="currency" sparklineData={[10, 15, 8, 25, 20, 30, 28]} />
        <MetricCard label={t('dash.salesCount')} value={summary.total_sales || 0} type="green" format="number" sparklineData={[5, 12, 10, 18, 14, 22, 25]} />
        <MetricCard label={t('dash.avgInvoice')} value={summary.avg_sale || 0} type="teal" format="currency" sparklineData={[20, 18, 25, 22, 28, 30, 35]} />
        <MetricCard label={t('dash.lowStock')} value={lowStockCount || 0} type="pink" format="number" sparklineData={[15, 12, 10, 8, 14, 11, 7]} />
      </div>

      {/* Details Row */}
      <div className="grid-12" style={{ marginBottom: '1.5rem' }}>
        <div className="col-8">
          <BaseCard title={t('dash.recentTransactions')}>
            <BaseTable
              columns={salesCols}
              rows={recentSales}
              loading={loading}
              renderCell={{
                id: ({ value }) => <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>#{value}</span>,
                customer_name: ({ value }) => value || t('dash.cashCustomer'),
                total: ({ value }) => (
                  <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {Number(value).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} {locale === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                ),
                status: ({ value }) => (
                  <span className={`badge ${statusClass(value)}`}>{t(`status.${value.toLowerCase()}`)}</span>
                ),
              }}
            />
          </BaseCard>
        </div>

        <div className="col-4">
          <BaseCard title={t('dash.branchAlerts')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {lowStockItems.slice(0, 5).map(item => (
                <StockAlert
                  key={item.id}
                  title={item.product}
                  message={`${t('dash.currentQty')}: ${item.quantity} | ${t('dash.minQty')}: ${item.min_qty}`}
                  severity="warning"
                />
              ))}
              {!lowStockItems.length && (
                <div className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  🎉 {t('dash.sufficientStock')}
                </div>
              )}
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  )
}
