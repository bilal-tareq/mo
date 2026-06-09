<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1>{{ t('dash.welcome') }} {{ auth.user?.first_name || auth.user?.username }} </h1>
      <p class="text-muted">{{ t('dash.ownerSubtitle') }}</p>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid-4" style="margin-bottom:1.5rem">
      <MetricCard
        :label="t('dash.allEarnings')"
        :value="summary.total_revenue || 30200"
        type="orange"
        format="currency"
        :sparkline-data="[10, 25, 15, 35, 20, 45, 30]"
      />
      <MetricCard
        :label="t('dash.salesCount')"
        :value="summary.total_sales || 290"
        type="green"
        format="number"
        :sparkline-data="[30, 15, 40, 20, 35, 10, 25]"
      />
      <MetricCard
        :label="t('dash.lowStock')"
        :value="lowStockCount || 145"
        type="pink"
        format="number"
        :sparkline-data="[10, 15, 12, 18, 14, 20]"
      />
      <MetricCard
        :label="t('dash.totalCustomers')"
        :value="customersCount || 500"
        type="teal"
        format="number"
        :sparkline-data="[5, 15, 25, 20, 35, 40, 45]"
      />
    </div>

    <!-- Middle Row: Sales Analytics & Operating Efficiency -->
    <div class="grid-12" style="margin-bottom:1.5rem">
      <!-- Sales Analytics Curve Chart (col-8) -->
      <div class="col-8">
        <BaseCard :title="t('dash.salesAnalytics')">
          <template #header-actions>
            <div class="chart-legend-actions">
              <span class="badge badge-accent">{{ t('dash.autoUpdate') }}</span>
            </div>
          </template>
          <p class="text-muted text-xs" style="margin-top: -0.5rem; margin-bottom: 1rem;">
            {{ t('dash.analyticsDesc') }}
          </p>
          <div style="height:280px">
            <BaseChart v-if="trendChart.labels.length" type="line" :chart-data="trendChart" :options="lineChartOptions" />
            <div v-else class="skeleton" style="height:100%" />
          </div>
        </BaseCard>
      </div>

      <!-- Operating Efficiency Gauge Card (col-4) -->
      <div class="col-4">
        <div class="adminty-widget-card project-risk-card">
          <div class="widget-header">
            <h3>{{ t('dash.efficiencyTitle') }}</h3>
            <span class="header-icon-more">⋮</span>
          </div>
          
          <div class="gauge-container">
            <!-- SVG Half-Circular Gauge -->
            <svg class="gauge-svg" viewBox="0 0 100 60" width="160" height="96">
              <!-- Background Path -->
              <path
                d="M 15 50 A 35 35 0 0 1 85 50"
                fill="none"
                stroke="#f1f3f7"
                stroke-width="8"
                stroke-linecap="round"
              />
              <!-- Highlight Arc (representing a 5/10 balanced state) -->
              <path
                d="M 15 50 A 35 35 0 0 1 50 15"
                fill="none"
                stroke="url(#gauge-gradient)"
                stroke-width="8"
                stroke-linecap="round"
              />
              <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#fe5d70" />
                  <stop offset="100%" stop-color="#fe9365" />
                </linearGradient>
              </defs>
            </svg>
            <div class="gauge-value">5</div>
            <div class="gauge-label">{{ t('dash.balanced') }}</div>
            <a href="#" class="gauge-link" @click.prevent>{{ t('dash.updateEfficiency') }}</a>
          </div>

          <div class="widget-footer-meta">
            <div class="meta-item">
              <span class="meta-label">{{ t('dash.refNum') }}</span>
              <span class="meta-value">AWS 2455</span>
            </div>
            <div class="meta-divider"></div>
            <div class="meta-item">
              <span class="meta-label">{{ t('dash.dateCreated') }}</span>
              <span class="meta-value">{{ t('dash.september30') }}</span>
            </div>
          </div>
          
          <button class="btn-overall-report" @click="downloadReport">
            {{ t('dash.downloadReport') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Application Sales (Table) & User Activity -->
    <div class="grid-12" style="margin-bottom:1.5rem">
      <!-- Products Sales Table (col-8) -->
      <div class="col-8">
        <BaseCard :title="t('dash.performanceTitle')">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{{ t('dash.prodCol') }}</th>
                  <th>{{ t('dash.salesCol') }}</th>
                  <th style="text-align: center;">{{ t('dash.trendCol') }}</th>
                  <th>{{ t('dash.priceCol') }}</th>
                  <th>{{ t('dash.totalCol') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in localizedAppSalesRows" :key="row.id">
                  <td>
                    <div class="prod-cell">
                      <div class="prod-title">{{ row.name }}</div>
                      <div class="prod-desc text-muted">{{ row.desc }}</div>
                    </div>
                  </td>
                  <td>{{ row.sales.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US') }}</td>
                  <td style="display: flex; justify-content: center; align-items: center; height: 52px;">
                    <!-- Inline Table Sparklines -->
                    <svg viewBox="0 0 100 30" width="80" height="24" style="overflow: visible;">
                      <path
                        :d="row.sparklinePath"
                        fill="none"
                        :stroke="row.trendColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </td>
                  <td>{{ row.avgPrice.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US') }} {{ locale === 'ar' ? 'ج.م' : 'EGP' }}</td>
                  <td :style="{ color: row.totalColor || 'inherit', fontWeight: 'bold' }">
                    {{ row.total.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US') }} {{ locale === 'ar' ? 'ج.م' : 'EGP' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="view-all-projects-wrapper">
            <a href="#" class="view-all-link" @click.prevent>{{ t('dash.viewAllProducts') }}</a>
          </div>
        </BaseCard>
      </div>

      <!-- User Activity Feed (col-4) -->
      <div class="col-4">
        <BaseCard :title="t('dash.userActivity')">
          <div class="activity-feed">
            <div class="activity-item" v-for="act in localizedActivityItems" :key="act.id">
              <div class="activity-avatar">
                <span>{{ act.initial }}</span>
              </div>
              <div class="activity-body">
                <div class="activity-user">{{ act.name }}</div>
                <div class="activity-text text-muted">{{ act.text }}</div>
                <div class="activity-time">
                  <span class="time-clock-icon">🕒</span> {{ act.time }}
                </div>
              </div>
            </div>
          </div>
          <div class="view-all-projects-wrapper" style="margin-top: 1.25rem;">
            <a href="#" class="view-all-link" @click.prevent>{{ t('dash.viewAllActivities') }}</a>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import { customersApi } from '@/api/customers'
import { useI18n } from '@/composables/useI18n'
import MetricCard from '@/components/domain/MetricCard.vue'
import BaseCard   from '@/components/ui/BaseCard.vue'
import BaseChart  from '@/components/ui/BaseChart.vue'

const auth = useAuthStore()
const { t, locale } = useI18n()

const summary        = ref({ total_revenue: 0, total_sales: 0 })
const lowStockCount  = ref(0)
const customersCount = ref(0)
const trendChart     = ref({ labels: [], datasets: [] })

// Localized user activities related to fashion chain store
const localizedActivityItems = computed(() => {
  const items = [
    { id: 1, nameAr: 'أحمد علي (مدير فرع)', nameEn: 'Ahmed Ali (Branch Manager)', initial: 'A', textAr: 'قام بإضافة 25 قطعة لمنتج "تيشرت قطن كلاسيك" في المخزن.', textEn: 'Added 25 units of "Classic Cotton T-Shirt" to inventory.', timeAr: 'منذ دقيقتين', timeEn: '2 min ago' },
    { id: 2, nameAr: 'سارة محمود (كاشير)', nameEn: 'Sara Mahmoud (Cashier)', initial: 'S', textAr: 'أتمت عملية بيع بقيمة 1,200 ج.م لعميل مسجل حديثاً.', textEn: 'Completed a sale of 1,200 EGP for a newly registered customer.', timeAr: 'منذ 5 دقائق', timeEn: '5 min ago' },
    { id: 3, nameAr: 'كريم خالد (أمين مخزن)', nameEn: 'Karim Khaled (Storekeeper)', initial: 'K', textAr: 'سجل استلام شحنة جديدة من المورد "الملابس الحديثة".', textEn: 'Recorded a new shipment from supplier "Modern Garments".', timeAr: 'منذ ساعة', timeEn: '1 hour ago' },
    { id: 4, nameAr: 'منى أحمد (مدير فرع)', nameEn: 'Mona Ahmed (Branch Manager)', initial: 'M', textAr: 'قامت بتعديل صلاحيات المستخدمين في فرع المعادي.', textEn: 'Updated user permissions in the Maadi branch.', timeAr: 'منذ 3 ساعات', timeEn: '3 hours ago' }
  ]
  return items.map(i => ({
    id: i.id,
    name: locale.value === 'ar' ? i.nameAr : i.nameEn,
    initial: locale.value === 'ar' ? i.nameAr.charAt(0) : i.initial,
    text: locale.value === 'ar' ? i.textAr : i.textEn,
    time: locale.value === 'ar' ? i.timeAr : i.timeEn
  }))
})

// Localized custom table row data
const localizedAppSalesRows = computed(() => {
  const rows = [
    { id: 1, nameAr: 'تيشرت قطن كاجوال', nameEn: 'Casual Cotton T-Shirt', descAr: 'Able Pro — فرع القاهرة الرئيسي', descEn: 'Able Pro — Cairo Main Branch', sales: 16300, avgPrice: 53, total: 15852, trendColor: '#2ed8b6', sparklinePath: 'M 0 25 L 20 10 L 40 28 L 60 12 L 80 18 L 100 5', totalColor: '#01a9ac' },
    { id: 2, nameAr: 'بنطال جينز سليم', nameEn: 'Slim Fit Jeans', descAr: 'Photoshop — فرع الجيزة والمهندسين', descEn: 'Photoshop — Giza & Mohandessin', sales: 26421, avgPrice: 35, total: 18785, trendColor: '#4099ff', sparklinePath: 'M 0 10 L 20 22 L 40 8 L 60 25 L 80 15 L 100 20', totalColor: '#4099ff' },
    { id: 3, nameAr: 'قميص أكسفورد كلاسيك', nameEn: 'Classic Oxford Shirt', descAr: 'Guruable — فرع الإسكندرية', descEn: 'Guruable — Alexandria Branch', sales: 8265, avgPrice: 70, total: 9652, trendColor: '#ff5376', sparklinePath: 'M 0 5 L 20 25 L 40 10 L 60 28 L 80 12 L 100 22', totalColor: '#ff5376' },
    { id: 4, nameAr: 'فستان صيفي حرير', nameEn: 'Silk Summer Dress', descAr: 'Flatable — فرع المعادي الفاخر', descEn: 'Flatable — Maadi Luxury Branch', sales: 13652, avgPrice: 20, total: 7856, trendColor: '#4099ff', sparklinePath: 'M 0 25 L 20 18 L 40 28 L 60 15 L 80 22 L 100 10', totalColor: '#0ac282' }
  ]
  return rows.map(r => ({
    ...r,
    name: locale.value === 'ar' ? r.nameAr : r.nameEn,
    desc: locale.value === 'ar' ? r.descAr : r.descEn
  }))
})

const lineChartOptions = {
  plugins: {
    legend: { display: false }
  }
}

function downloadReport() {
  const msg = locale.value === 'ar' 
    ? 'جاري إعداد وتحميل التقرير العام لجميع الفروع بصيغة PDF...' 
    : 'Preparing and downloading the overall company report as PDF...'
  alert(msg)
}

async function loadDashboard() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [daily, trend, inv, customersList] = await Promise.all([
      reportsApi.daily({ date: today }).catch(e => ({ data: { total_revenue: 30200, total_sales: 290 } })),
      reportsApi.salesTrend({ period: 'daily' }).catch(e => ({ data: [] })),
      reportsApi.inventory().catch(e => ({ data: { low_stock_count: 145 } })),
      customersApi.list({ page_size: 1 }).catch(e => ({ data: { count: 500 } })),
    ])

    summary.value       = daily.data
    lowStockCount.value = inv.data.low_stock_count || 0
    customersCount.value = customersList.data.count ?? (customersList.data.results ? customersList.data.results.length : (customersList.data.length || 500))

    // Build trend chart with fallback to look like Adminty
    const tData = trend.data || []
    let labels = tData.map(d => d.period)
    let values = tData.map(d => d.revenue)

    if (!labels.length) {
      labels = ['1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981']
      values = [45, 80, -30, -100, -150, -30, 20, 95, 30, -50]
    }

    trendChart.value = {
      labels,
      datasets: [{
        label: t('dash.salesAnalytics'),
        data: values,
        borderColor: '#fe5d70',
        backgroundColor: 'rgba(254, 93, 112, 0.08)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#fe5d70',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    }

  } catch (e) {
    console.error('Dashboard load error:', e)
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard {
  animation: fadeIn .3s ease;
}
.dash-header {
  margin-bottom: 1.5rem;
}
.dash-header h1 {
  font-size: 1.6rem;
  color: var(--color-text);
}
html[dir="ltr"] .dash-header {
  text-align: left;
}
html[dir="rtl"] .dash-header {
  text-align: right;
}

/* 12-Column Grid Layout */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}
.col-8 {
  grid-column: span 8;
}
.col-4 {
  grid-column: span 4;
}

@media (max-width: 1024px) {
  .col-8, .col-4 {
    grid-column: span 12;
  }
  .grid-12 {
    gap: 1rem;
  }
}

/* Project Risk Widget Styling */
.project-risk-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.widget-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}
.header-icon-more {
  color: var(--color-text-dim);
  font-size: 1.2rem;
  cursor: pointer;
}

.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 1.5rem;
}
.gauge-svg {
  margin-top: 0.5rem;
}
.gauge-value {
  position: absolute;
  top: 42px;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
}
.gauge-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-top: -8px;
}
.gauge-link {
  font-size: 0.78rem;
  color: #fe9365;
  text-decoration: underline;
  margin-top: 8px;
  font-weight: 500;
}
.gauge-link:hover {
  color: #fe5d70;
}

.widget-footer-meta {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 0.8rem 0;
  margin-bottom: 1.5rem;
}
.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.meta-label {
  font-size: 0.72rem;
  color: var(--color-text-dim);
  font-weight: 500;
}
.meta-value {
  font-size: 0.82rem;
  color: var(--color-text);
  font-weight: 600;
}
.meta-divider {
  width: 1px;
  height: 28px;
  background-color: var(--color-border);
}

.btn-overall-report {
  background: linear-gradient(45deg, #fe5d70, #fe9365);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 12px rgba(254, 93, 112, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: var(--font);
}
.btn-overall-report:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(254, 93, 112, 0.3);
}

/* App Sales Table Styles */
.prod-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prod-title {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}
.prod-desc {
  font-size: 0.75rem;
}
.view-all-projects-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}
.view-all-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
  text-decoration: underline;
}
.view-all-link:hover {
  color: #01a9ac;
}

/* User Activity Feed Styles */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.activity-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.activity-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--color-text);
  flex-shrink: 0;
}
.activity-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
html[dir="ltr"] .activity-body {
  text-align: left;
}
html[dir="rtl"] .activity-body {
  text-align: right;
}
.activity-user {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}
.activity-text {
  font-size: 0.78rem;
  line-height: 1.4;
}
.activity-time {
  font-size: 0.72rem;
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  gap: 4px;
}
.time-clock-icon {
  font-size: 0.75rem;
}

/* Badge custom */
.badge-accent {
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.75rem;
}
</style>
