<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1>{{ t('nav.branch') }}</h1>
      <p class="text-muted">{{ t('dash.branchSubtitle') }} {{ auth.user?.branch_name || t('dash.cashCustomer') }}</p>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid-4" style="margin-bottom:1.5rem">
      <MetricCard
        :label="t('dash.allEarnings')"
        :value="summary.total_revenue || 0"
        type="orange"
        format="currency"
        :sparkline-data="[10, 15, 8, 25, 20, 30, 28]"
      />
      <MetricCard
        :label="t('dash.salesCount')"
        :value="summary.total_sales || 0"
        type="green"
        format="number"
        :sparkline-data="[5, 12, 10, 18, 14, 22, 25]"
      />
      <MetricCard
        :label="t('dash.avgInvoice')"
        :value="summary.avg_sale || 0"
        type="teal"
        format="currency"
        :sparkline-data="[20, 18, 25, 22, 28, 30, 35]"
      />
      <MetricCard
        :label="t('dash.lowStock')"
        :value="lowStockCount || 0"
        type="pink"
        format="number"
        :sparkline-data="[15, 12, 10, 8, 14, 11, 7]"
      />
    </div>

    <!-- Details Row -->
    <div class="grid-12" style="margin-bottom:1.5rem">
      <!-- Recent Sales (col-8) -->
      <div class="col-8">
        <BaseCard :title="t('dash.recentTransactions')">
          <BaseTable :columns="salesCols" :rows="recentSales" :loading="loading">
            <template #cell-id="{ value }">
              <span style="font-weight: 600; color: var(--color-text-muted);">#{{ value }}</span>
            </template>
            <template #cell-customer_name="{ value }">
              {{ value || t('dash.cashCustomer') }}
            </template>
            <template #cell-total="{ value }">
              <span style="font-weight: 700; color: var(--color-text);">
                {{ Number(value).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US') }} {{ locale === 'ar' ? 'ج.م' : 'EGP' }}
              </span>
            </template>
            <template #cell-status="{ value }">
              <span :class="['badge', statusClass(value)]">{{ t(`status.${value.toLowerCase()}`) }}</span>
            </template>
          </BaseTable>
        </BaseCard>
      </div>

      <!-- Stock Alerts (col-4) -->
      <div class="col-4">
        <BaseCard :title="t('dash.branchAlerts')">
          <div style="display:flex;flex-direction:column;gap:.75rem">
            <StockAlert
              v-for="item in lowStockItems.slice(0,5)"
              :key="item.id"
              :title="item.product"
              :message="`${t('dash.currentQty')}: ${item.quantity} | ${t('dash.minQty')}: ${item.min_qty}`"
              severity="warning"
            />
            <div v-if="!lowStockItems.length" class="text-muted" style="text-align: center; padding: 2rem 0;">
              🎉 {{ t('dash.sufficientStock') }}
            </div>
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
import { salesApi }   from '@/api/sales'
import { useI18n } from '@/composables/useI18n'
import MetricCard from '@/components/domain/MetricCard.vue'
import StockAlert from '@/components/domain/StockAlert.vue'
import BaseCard   from '@/components/ui/BaseCard.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'

const auth = useAuthStore()
const { t, locale } = useI18n()

const summary       = ref({ total_revenue: 0, total_sales: 0, avg_sale: 0 })
const lowStockItems = ref([])
const lowStockCount = ref(0)
const recentSales   = ref([])
const loading       = ref(true)

const salesCols = computed(() => [
  { key: 'id',            label: t('dash.invoiceNo') },
  { key: 'customer_name', label: t('dash.customer') },
  { key: 'total',         label: t('dash.total') },
  { key: 'status',        label: t('dash.status') },
])

const statusClass = s => ({
  COMPLETED: 'badge-success',
  PENDING:   'badge-warning',
  REFUNDED:  'badge-info',
  CANCELLED: 'badge-danger'
})[s] || ''

async function load() {
  const today = new Date().toISOString().split('T')[0]
  try {
    const [daily, inv, sales] = await Promise.all([
      reportsApi.daily({ date: today }).catch(e => ({ data: { total_revenue: 0, total_sales: 0, avg_sale: 0 } })),
      reportsApi.inventory().catch(e => ({ data: { low_stock_items: [], low_stock_count: 0 } })),
      salesApi.list({ page_size: 6 }).catch(e => ({ data: { results: [] } })),
    ])
    summary.value       = daily.data
    lowStockItems.value = inv.data.low_stock_items || []
    lowStockCount.value = inv.data.low_stock_count || 0
    recentSales.value   = (sales.data.results || sales.data || []).slice(0, 6)
  } catch (error) {
    console.error('Failed to load branch dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(load)
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
</style>
