<template>
  <div>
    <div class="page-header">
      <h1>سجل المبيعات</h1>
      <div class="filters">
        <input v-model="dateFrom" type="date" class="form-input" style="width:150px" />
        <input v-model="dateTo"   type="date" class="form-input" style="width:150px" />
        <BaseButton @click="load" :loading="loading">بحث</BaseButton>
      </div>
    </div>

    <BaseTable :columns="cols" :rows="sales" :loading="loading">
      <template #cell-total="{ value }">{{ Number(value).toLocaleString('ar-EG') }} ج.م</template>
      <template #cell-status="{ value }">
        <span :class="['badge', statusClass(value)]">{{ statusLabel(value) }}</span>
      </template>
      <template #cell-created_at="{ value }">{{ new Date(value).toLocaleDateString('ar-EG') }}</template>
      <template #actions="{ row }">
        <BaseButton size="sm" variant="secondary" @click="viewSale(row)">عرض</BaseButton>
      </template>
    </BaseTable>

    <!-- Sale Detail Modal -->
    <BaseModal v-model="detailModal" title="تفاصيل الفاتورة" size="lg">
      <div v-if="selectedSale">
        <div class="sale-meta">
          <div><strong>العميل:</strong> {{ selectedSale.customer_name || 'عميل زائر' }}</div>
          <div><strong>البائع:</strong> {{ selectedSale.sold_by_name }}</div>
          <div><strong>التاريخ:</strong> {{ new Date(selectedSale.created_at).toLocaleString('ar-EG') }}</div>
        </div>
        <BaseTable :columns="itemCols" :rows="selectedSale.items" style="margin-top:1rem">
          <template #cell-unit_price="{ value }">{{ Number(value).toLocaleString('ar-EG') }}</template>
          <template #cell-total_price="{ value }">{{ Number(value).toLocaleString('ar-EG') }}</template>
        </BaseTable>
        <div class="sale-totals">
          <div>المجموع الفرعي: <strong>{{ selectedSale.subtotal }} ج.م</strong></div>
          <div>الخصم: <strong>{{ selectedSale.discount }} ج.م</strong></div>
          <div>الضريبة: <strong>{{ selectedSale.tax }} ج.م</strong></div>
          <div class="grand-total">الإجمالي: <strong>{{ selectedSale.total }} ج.م</strong></div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { salesApi } from '@/api/sales'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const sales        = ref([])
const loading      = ref(false)
const detailModal  = ref(false)
const selectedSale = ref(null)
const dateFrom     = ref('')
const dateTo       = ref('')

const cols = [
  { key: 'id',            label: '#' },
  { key: 'customer_name', label: 'العميل' },
  { key: 'sold_by_name',  label: 'البائع' },
  { key: 'total',         label: 'الإجمالي' },
  { key: 'status',        label: 'الحالة' },
  { key: 'created_at',    label: 'التاريخ' },
]

const itemCols = [
  { key: 'variant_name', label: 'المنتج' },
  { key: 'quantity',     label: 'الكمية' },
  { key: 'unit_price',   label: 'سعر الوحدة' },
  { key: 'total_price',  label: 'الإجمالي' },
]

const statusLabel = s => ({ COMPLETED: 'مكتمل', PENDING: 'معلق', REFUNDED: 'مسترجع', CANCELLED: 'ملغي' })[s] || s
const statusClass = s => ({ COMPLETED: 'badge-success', PENDING: 'badge-warning', REFUNDED: 'badge-info', CANCELLED: 'badge-danger' })[s] || ''

async function load() {
  loading.value = true
  const params = {}
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value)   params.date_to   = dateTo.value
  try { const { data } = await salesApi.list(params); sales.value = data.results || data }
  finally { loading.value = false }
}

async function viewSale(row) {
  const { data } = await salesApi.get(row.id)
  selectedSale.value = data
  detailModal.value  = true
}

onMounted(load)
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.filters { display:flex; gap:.75rem; align-items:center; }
.sale-meta { display:flex; gap:2rem; flex-wrap:wrap; font-size:.9rem; padding:.5rem 0; }
.sale-totals { text-align:left; margin-top:1rem; display:flex; flex-direction:column; align-items:flex-end; gap:.3rem; font-size:.9rem; }
.grand-total { font-size:1.1rem; color:var(--color-accent); padding-top:.5rem; border-top:1px solid var(--color-border); }
</style>
