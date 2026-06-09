<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1>مرحباً، {{ auth.user?.first_name || auth.user?.username }} </h1>
      <p class="text-muted">نظرة عامة على أداء جميع الفروع</p>
    </div>

    <!-- Metric Cards -->
    <div class="grid-4" style="margin-bottom:1.5rem">
      <MetricCard label="إجمالي المبيعات اليوم" :value="summary.total_revenue" icon="" format="currency" color="var(--color-accent)"   :trend="12" />
      <MetricCard label="عدد المعاملات"          :value="summary.total_sales"   icon="" format="number"   color="var(--color-success)"  :trend="5"  />
      <MetricCard label="المخزون المنخفض"        :value="lowStockCount"         icon="" format="number"   color="var(--color-warning)"  />
      <MetricCard label="إجمالي العملاء"         :value="customersCount"        icon="" format="number"   color="var(--color-info)"     />
    </div>

    <!-- Charts Row -->
    <div class="grid-2" style="margin-bottom:1.5rem">
      <BaseCard title="مبيعات آخر 7 أيام">
        <div style="height:220px">
          <BaseChart v-if="trendChart.labels.length" type="line" :chart-data="trendChart" />
          <div v-else class="skeleton" style="height:100%" />
        </div>
      </BaseCard>

      <BaseCard title="مقارنة الفروع">
        <div style="height:220px">
          <BaseChart v-if="branchChart.labels.length" type="bar" :chart-data="branchChart" />
          <div v-else class="skeleton" style="height:100%" />
        </div>
      </BaseCard>
    </div>

    <!-- Low Stock Alerts -->
    <BaseCard title="تنبيهات المخزون المنخفض" style="margin-bottom:1.5rem">
      <div v-if="loadingInventory" class="skeleton" style="height:100px" />
      <div v-else-if="lowStockItems.length" style="display:flex;flex-direction:column;gap:.5rem">
        <StockAlert
          v-for="item in lowStockItems.slice(0,5)"
          :key="item.id"
          :title="`${item.product} — ${item.variant}`"
          :message="`الكمية: ${item.quantity} | الحد الأدنى: ${item.min_qty} | الفرع: ${item.branch}`"
          severity="warning"
        />
      </div>
      <div v-else class="text-muted" style="padding:.5rem 0"> جميع المنتجات بمستوى كافٍ</div>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import MetricCard from '@/components/domain/MetricCard.vue'
import StockAlert from '@/components/domain/StockAlert.vue'
import BaseCard   from '@/components/ui/BaseCard.vue'
import BaseChart  from '@/components/ui/BaseChart.vue'

const auth = useAuthStore()
const summary        = ref({ total_revenue: 0, total_sales: 0 })
const lowStockItems  = ref([])
const lowStockCount  = ref(0)
const customersCount = ref(0)
const loadingInventory = ref(true)

const trendChart = ref({ labels: [], datasets: [] })
const branchChart = ref({ labels: [], datasets: [] })

async function loadDashboard() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [daily, trend, branchComp, inv] = await Promise.all([
      reportsApi.daily({ date: today }),
      reportsApi.salesTrend({ period: 'daily' }),
      reportsApi.branchComparison(),
      reportsApi.inventory(),
    ])

    summary.value       = daily.data
    lowStockItems.value = inv.data.low_stock_items || []
    lowStockCount.value = inv.data.low_stock_count || 0

    // Build trend chart
    const tData = trend.data
    trendChart.value = {
      labels:   tData.map(d => d.period),
      datasets: [{
        label: 'المبيعات',
        data:  tData.map(d => d.revenue),
        borderColor: '#7c6aff',
        backgroundColor: 'rgba(124,106,255,.1)',
        fill: true,
        tension: .4,
        pointBackgroundColor: '#7c6aff',
      }]
    }

    // Build branch chart
    const bData = branchComp.data
    branchChart.value = {
      labels:   bData.map(d => d.branch__name),
      datasets: [{
        label: 'الإيراد',
        data:  bData.map(d => d.revenue),
        backgroundColor: ['#7c6aff','#ff6a9d','#22d07a','#f5a623','#38c7ff'],
        borderRadius: 6,
      }]
    }
  } catch (e) {
    console.error('Dashboard load error:', e)
  } finally {
    loadingInventory.value = false
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard { animation: fadeIn .3s ease; }
.dash-header { margin-bottom: 1.5rem; }
.dash-header h1 { font-size: 1.6rem; }
</style>
