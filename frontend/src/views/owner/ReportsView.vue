<template>
  <div>
    <h1 style="margin-bottom:1.5rem">التقارير والإحصائيات</h1>

    <!-- Filters -->
    <BaseCard style="margin-bottom:1.5rem">
      <div class="filters">
        <div class="form-group" style="margin:0">
          <label class="form-label">الفترة</label>
          <select v-model="period" class="form-select">
            <option value="daily">يومي</option>
            <option value="monthly">شهري</option>
          </select>
        </div>
        <div class="form-group" style="margin:0">
          <label class="form-label">الشهر</label>
          <input v-model="selectedMonth" type="month" class="form-input" />
        </div>
        <BaseButton @click="loadReports" :loading="loading">تحديث</BaseButton>
      </div>
    </BaseCard>

    <!-- Charts -->
    <div class="grid-2" style="margin-bottom:1.5rem">
      <BaseCard title="اتجاه المبيعات">
        <div style="height:250px">
          <BaseChart type="line" :chart-data="trendChart" />
        </div>
      </BaseCard>
      <BaseCard title="مقارنة الفروع">
        <div style="height:250px">
          <BaseChart type="bar" :chart-data="branchChart" />
        </div>
      </BaseCard>
    </div>

    <!-- Top Products -->
    <BaseCard title="أكثر المنتجات مبيعاً">
      <BaseTable :columns="topCols" :rows="topProducts" :loading="loading">
        <template #cell-revenue="{ value }">{{ Number(value).toLocaleString('ar-EG') }} ج.م</template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportsApi } from '@/api/reports'
import BaseCard   from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseChart  from '@/components/ui/BaseChart.vue'

const period        = ref('daily')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const loading       = ref(false)
const topProducts   = ref([])

const trendChart  = ref({ labels: [], datasets: [] })
const branchChart = ref({ labels: [], datasets: [] })

const topCols = [
  { key: 'variant__product__name', label: 'المنتج' },
  { key: 'units_sold',             label: 'الوحدات المباعة' },
  { key: 'revenue',                label: 'الإيراد' },
]

async function loadReports() {
  loading.value = true
  try {
    const [trend, branch, top] = await Promise.all([
      reportsApi.salesTrend({ period: period.value }),
      reportsApi.branchComparison({ month: selectedMonth.value }),
      reportsApi.topProducts({ limit: 10 }),
    ])

    trendChart.value = {
      labels:   trend.data.map(d => d.period),
      datasets: [{
        label: 'المبيعات',
        data:  trend.data.map(d => d.revenue),
        borderColor: '#7c6aff', backgroundColor: 'rgba(124,106,255,.1)',
        fill: true, tension: .4,
      }]
    }

    branchChart.value = {
      labels:   branch.data.map(d => d.branch__name),
      datasets: [{
        label: 'الإيراد',
        data:  branch.data.map(d => d.revenue),
        backgroundColor: ['#7c6aff','#ff6a9d','#22d07a','#f5a623','#38c7ff'],
        borderRadius: 6,
      }]
    }

    topProducts.value = top.data
  } finally {
    loading.value = false
  }
}

onMounted(loadReports)
</script>

<style scoped>
.filters { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
</style>
