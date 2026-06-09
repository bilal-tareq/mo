<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1>لوحة تحكم الفرع</h1>
      <p class="text-muted">{{ auth.user?.branch_name || 'فرعك اليوم' }}</p>
    </div>

    <div class="grid-4" style="margin-bottom:1.5rem">
      <MetricCard label="مبيعات اليوم"     :value="summary.total_revenue" icon="" format="currency" color="var(--color-accent)"  :trend="8" />
      <MetricCard label="عدد الفواتير"     :value="summary.total_sales"   icon="" format="number"   color="var(--color-success)" />
      <MetricCard label="متوسط الفاتورة"   :value="summary.avg_sale"      icon="" format="currency" color="var(--color-info)"    />
      <MetricCard label="تنبيهات المخزون"  :value="lowStockCount"         icon="" format="number"   color="var(--color-warning)" />
    </div>

    <div class="grid-2">
      <BaseCard title="أحدث المبيعات">
        <BaseTable :columns="salesCols" :rows="recentSales" :loading="loading">
          <template #cell-total="{ value }">{{ Number(value).toLocaleString('ar-EG') }} ج.م</template>
          <template #cell-status="{ value }">
            <span :class="['badge', statusClass(value)]">{{ value }}</span>
          </template>
        </BaseTable>
      </BaseCard>

      <BaseCard title="تنبيهات المخزون">
        <div style="display:flex;flex-direction:column;gap:.5rem">
          <StockAlert
            v-for="item in lowStockItems.slice(0,4)"
            :key="item.id"
            :title="item.product"
            :message="`الكمية: ${item.quantity} | الحد: ${item.min_qty}`"
            severity="warning"
          />
          <div v-if="!lowStockItems.length" class="text-muted"> المخزون بمستوى جيد</div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { reportsApi } from '@/api/reports'
import { salesApi }   from '@/api/sales'
import MetricCard from '@/components/domain/MetricCard.vue'
import StockAlert from '@/components/domain/StockAlert.vue'
import BaseCard   from '@/components/ui/BaseCard.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'

const auth = useAuthStore()
const summary       = ref({ total_revenue: 0, total_sales: 0, avg_sale: 0 })
const lowStockItems = ref([])
const lowStockCount = ref(0)
const recentSales   = ref([])
const loading       = ref(true)

const salesCols = [
  { key: 'id',            label: '#' },
  { key: 'customer_name', label: 'العميل' },
  { key: 'total',         label: 'الإجمالي' },
  { key: 'status',        label: 'الحالة' },
]

const statusClass = s => ({ COMPLETED: 'badge-success', PENDING: 'badge-warning', REFUNDED: 'badge-info', CANCELLED: 'badge-danger' })[s] || ''

async function load() {
  const today = new Date().toISOString().split('T')[0]
  try {
    const [daily, inv, sales] = await Promise.all([
      reportsApi.daily({ date: today }),
      reportsApi.inventory(),
      salesApi.list({ page_size: 5 }),
    ])
    summary.value       = daily.data
    lowStockItems.value = inv.data.low_stock_items || []
    lowStockCount.value = inv.data.low_stock_count || 0
    recentSales.value   = (sales.data.results || sales.data).slice(0, 5)
  } finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.dash-header { margin-bottom: 1.5rem; }
</style>
