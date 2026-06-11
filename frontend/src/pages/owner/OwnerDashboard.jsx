import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import { customersApi } from '@/api/customers'
import { useI18n } from '@/hooks/useI18n'
import MetricCard from '@/components/domain/MetricCard'
import BaseCard from '@/components/ui/BaseCard'
import BaseChart from '@/components/ui/BaseChart'
import './OwnerDashboard.css'

export default function OwnerDashboard() {
  const user = useAuthStore(s => s.user)
  const { t, locale } = useI18n()

  const [summary, setSummary] = useState({ total_revenue: 0, total_sales: 0 })
  const [lowStockCount, setLowStockCount] = useState(0)
  const [customersCount, setCustomersCount] = useState(0)
  const [trendChart, setTrendChart] = useState({ labels: [], datasets: [] })

  const localizedActivityItems = useMemo(() => {
    const items = [
      { id: 1, nameAr: 'أحمد علي (مدير فرع)', nameEn: 'Ahmed Ali (Branch Manager)', initial: 'A', textAr: 'قام بإضافة 25 قطعة لمنتج "تيشرت قطن كلاسيك" في المخزن.', textEn: 'Added 25 units of "Classic Cotton T-Shirt" to inventory.', timeAr: 'منذ دقيقتين', timeEn: '2 min ago' },
      { id: 2, nameAr: 'سارة محمود (مديرة فرع)', nameEn: 'Sara Mahmoud (Branch Manager)', initial: 'S', textAr: 'أتمت عملية بيع بقيمة 1,200 ج.م لعميل مسجل حديثاً.', textEn: 'Completed a sale of 1,200 EGP for a newly registered customer.', timeAr: 'منذ 5 دقائق', timeEn: '5 min ago' },
      { id: 3, nameAr: 'كريم خالد (مدير فرع)', nameEn: 'Karim Khaled (Branch Manager)', initial: 'K', textAr: 'قام بتحديث كميات المخزن لفرع الإسكندرية.', textEn: 'Updated inventory quantities for the Alexandria branch.', timeAr: 'منذ ساعة', timeEn: '1 hour ago' },
      { id: 4, nameAr: 'منى أحمد (مدير فرع)', nameEn: 'Mona Ahmed (Branch Manager)', initial: 'M', textAr: 'قامت بتعديل صلاحيات المستخدمين في فرع المعادي.', textEn: 'Updated user permissions in the Maadi branch.', timeAr: 'منذ 3 ساعات', timeEn: '3 hours ago' }
    ]
    return items.map(i => ({ id: i.id, name: locale === 'ar' ? i.nameAr : i.nameEn, initial: locale === 'ar' ? i.nameAr.charAt(0) : i.initial, text: locale === 'ar' ? i.textAr : i.textEn, time: locale === 'ar' ? i.timeAr : i.timeEn }))
  }, [locale])

  const localizedAppSalesRows = useMemo(() => {
    const rows = [
      { id: 1, nameAr: 'تيشرت قطن كاجوال', nameEn: 'Casual Cotton T-Shirt', descAr: 'Able Pro — فرع القاهرة الرئيسي', descEn: 'Able Pro — Cairo Main Branch', sales: 16300, avgPrice: 53, total: 15852, trendColor: '#2ed8b6', sparklinePath: 'M 0 25 L 20 10 L 40 28 L 60 12 L 80 18 L 100 5', totalColor: '#01a9ac' },
      { id: 2, nameAr: 'بنطال جينز سليم', nameEn: 'Slim Fit Jeans', descAr: 'Photoshop — فرع الجيزة والمهندسين', descEn: 'Photoshop — Giza & Mohandessin', sales: 26421, avgPrice: 35, total: 18785, trendColor: '#4099ff', sparklinePath: 'M 0 10 L 20 22 L 40 8 L 60 25 L 80 15 L 100 20', totalColor: '#4099ff' },
      { id: 3, nameAr: 'قميص أكسفورد كلاسيك', nameEn: 'Classic Oxford Shirt', descAr: 'Guruable — فرع الإسكندرية', descEn: 'Guruable — Alexandria Branch', sales: 8265, avgPrice: 70, total: 9652, trendColor: '#ff5376', sparklinePath: 'M 0 5 L 20 25 L 40 10 L 60 28 L 80 12 L 100 22', totalColor: '#ff5376' },
      { id: 4, nameAr: 'فستان صيفي حرير', nameEn: 'Silk Summer Dress', descAr: 'Flatable — فرع المعادي الفاخر', descEn: 'Flatable — Maadi Luxury Branch', sales: 13652, avgPrice: 20, total: 7856, trendColor: '#4099ff', sparklinePath: 'M 0 25 L 20 18 L 40 28 L 60 15 L 80 22 L 100 10', totalColor: '#0ac282' }
    ]
    return rows.map(r => ({ ...r, name: locale === 'ar' ? r.nameAr : r.nameEn, desc: locale === 'ar' ? r.descAr : r.descEn }))
  }, [locale])

  function downloadReport() {
    alert(locale === 'ar' ? 'جاري إعداد وتحميل التقرير العام لجميع الفروع بصيغة PDF...' : 'Preparing and downloading the overall company report as PDF...')
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const [daily, trend, inv, customersList] = await Promise.all([
          reportsApi.daily({ date: today }).catch(() => ({ data: { total_revenue: 30200, total_sales: 290 } })),
          reportsApi.salesTrend({ period: 'daily' }).catch(() => ({ data: [] })),
          reportsApi.inventory().catch(() => ({ data: { low_stock_count: 145 } })),
          customersApi.list({ page_size: 1 }).catch(() => ({ data: { count: 500 } })),
        ])
        setSummary(daily.data)
        setLowStockCount(inv.data.low_stock_count || 0)
        setCustomersCount(customersList.data.count ?? (customersList.data.results ? customersList.data.results.length : (customersList.data.length || 500)))

        const tData = trend.data || []
        let labels = tData.map(d => d.period)
        let values = tData.map(d => d.revenue)
        if (!labels.length) { labels = ['1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981']; values = [45, 80, -30, -100, -150, -30, 20, 95, 30, -50] }
        setTrendChart({ labels, datasets: [{ label: t('dash.salesAnalytics'), data: values, borderColor: '#fe5d70', backgroundColor: 'rgba(254, 93, 112, 0.08)', fill: true, tension: 0.45, pointBackgroundColor: '#fe5d70', pointBorderColor: '#ffffff', pointBorderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6 }] })
      } catch (e) { console.error('Dashboard load error:', e) }
    }
    loadDashboard()
  }, [])

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--color-text)' }}>{t('dash.welcome')} {user?.first_name || user?.username}</h1>
        <p className="text-muted">{t('dash.ownerSubtitle')}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <MetricCard label={t('dash.allEarnings')} value={summary.total_revenue || 30200} type="orange" format="currency" sparklineData={[10, 25, 15, 35, 20, 45, 30]} />
        <MetricCard label={t('dash.salesCount')} value={summary.total_sales || 290} type="green" format="number" sparklineData={[30, 15, 40, 20, 35, 10, 25]} />
        <MetricCard label={t('dash.lowStock')} value={lowStockCount || 145} type="pink" format="number" sparklineData={[10, 15, 12, 18, 14, 20]} />
        <MetricCard label={t('dash.totalCustomers')} value={customersCount || 500} type="teal" format="number" sparklineData={[5, 15, 25, 20, 35, 40, 45]} />
      </div>

      <div className="grid-12" style={{ marginBottom: '1.5rem' }}>
        <div className="col-8">
          <BaseCard title={t('dash.salesAnalytics')} headerActions={<span className="badge badge-accent">{t('dash.autoUpdate')}</span>}>
            <p className="text-muted" style={{ fontSize: '.75rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{t('dash.analyticsDesc')}</p>
            <div style={{ height: 280 }}>
              {trendChart.labels.length ? <BaseChart type="line" chartData={trendChart} options={{ plugins: { legend: { display: false } } }} /> : <div className="skeleton" style={{ height: '100%' }} />}
            </div>
          </BaseCard>
        </div>

        <div className="col-4">
          <div className="project-risk-card">
            <div className="widget-header"><h3>{t('dash.efficiencyTitle')}</h3><span className="header-icon-more">⋮</span></div>
            <div className="gauge-container">
              <svg className="gauge-svg" viewBox="0 0 100 60" width="160" height="96">
                <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#f1f3f7" strokeWidth="8" strokeLinecap="round" />
                <path d="M 15 50 A 35 35 0 0 1 50 15" fill="none" stroke="url(#gauge-gradient)" strokeWidth="8" strokeLinecap="round" />
                <defs><linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#fe5d70" /><stop offset="100%" stopColor="#fe9365" /></linearGradient></defs>
              </svg>
              <div className="gauge-value">5</div>
              <div className="gauge-label">{t('dash.balanced')}</div>
              <a href="#" className="gauge-link" onClick={e => e.preventDefault()}>{t('dash.updateEfficiency')}</a>
            </div>
            <div className="widget-footer-meta">
              <div className="meta-item"><span className="meta-label">{t('dash.refNum')}</span><span className="meta-value">AWS 2455</span></div>
              <div className="meta-divider"></div>
              <div className="meta-item"><span className="meta-label">{t('dash.dateCreated')}</span><span className="meta-value">{t('dash.september30')}</span></div>
            </div>
            <button className="btn-overall-report" onClick={downloadReport}>{t('dash.downloadReport')}</button>
          </div>
        </div>
      </div>

      <div className="grid-12" style={{ marginBottom: '1.5rem' }}>
        <div className="col-8">
          <BaseCard title={t('dash.performanceTitle')}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>{t('dash.prodCol')}</th><th>{t('dash.salesCol')}</th><th style={{ textAlign: 'center' }}>{t('dash.trendCol')}</th><th>{t('dash.priceCol')}</th><th>{t('dash.totalCol')}</th></tr></thead>
                <tbody>
                  {localizedAppSalesRows.map(row => (
                    <tr key={row.id}>
                      <td><div className="prod-cell"><div className="prod-title">{row.name}</div><div className="prod-desc text-muted">{row.desc}</div></div></td>
                      <td>{row.sales.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}</td>
                      <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 52 }}>
                        <svg viewBox="0 0 100 30" width="80" height="24" style={{ overflow: 'visible' }}><path d={row.sparklinePath} fill="none" stroke={row.trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </td>
                      <td>{row.avgPrice.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                      <td style={{ color: row.totalColor || 'inherit', fontWeight: 'bold' }}>{row.total.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} {locale === 'ar' ? 'ج.م' : 'EGP'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="view-all-projects-wrapper"><a href="#" className="view-all-link" onClick={e => e.preventDefault()}>{t('dash.viewAllProducts')}</a></div>
          </BaseCard>
        </div>

        <div className="col-4">
          <BaseCard title={t('dash.userActivity')}>
            <div className="activity-feed">
              {localizedActivityItems.map(act => (
                <div className="activity-item" key={act.id}>
                  <div className="activity-avatar"><span>{act.initial}</span></div>
                  <div className="activity-body">
                    <div className="activity-user">{act.name}</div>
                    <div className="activity-text text-muted">{act.text}</div>
                    <div className="activity-time"><span className="time-clock-icon">🕒</span> {act.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-projects-wrapper" style={{ marginTop: '1.25rem' }}><a href="#" className="view-all-link" onClick={e => e.preventDefault()}>{t('dash.viewAllActivities')}</a></div>
          </BaseCard>
        </div>
      </div>
    </div>
  )
}
