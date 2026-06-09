<template>
  <div>
    <div class="page-header">
      <h1>إدارة المخزون</h1>
      <div class="filters">
        <input v-model="search" type="text" class="form-input" placeholder="بحث..." style="width:200px" />
        <select v-model="lowStockFilter" class="form-select" style="width:160px">
          <option value="">جميع المنتجات</option>
          <option value="true">منخفض المخزون فقط</option>
        </select>
        <BaseButton @click="load" :loading="loading">تحديث</BaseButton>
      </div>
    </div>

    <BaseTable :columns="cols" :rows="filteredStock" :loading="loading">
      <template #cell-quantity="{ row }">
        <span :class="['badge', row.is_low_stock ? 'badge-danger' : 'badge-success']">
          {{ row.quantity }}
        </span>
      </template>
      <template #cell-is_low_stock="{ value }">
        <span v-if="value" class="badge badge-warning">منخفض</span>
        <span v-else class="badge badge-success">كافي</span>
      </template>
      <template #actions="{ row }">
        <BaseButton size="sm" variant="secondary" @click="openAdjust(row)">تعديل</BaseButton>
      </template>
    </BaseTable>

    <BaseModal v-model="adjustModal" title="تعديل المخزون">
      <div v-if="errorMessage" style="color: var(--color-danger); background: rgba(255, 77, 106, 0.1); border: 1px solid rgba(255, 77, 106, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div v-if="selected">
        <p style="margin-bottom:1rem;color:var(--color-text-muted)">{{ selected.variant_name }}</p>
        <div class="form-group">
          <label class="form-label">نوع الحركة</label>
          <select v-model="adjForm.movement_type" class="form-select">
            <option value="IN">إدخل مخزون</option>
            <option value="OUT">إخراج مخزون</option>
            <option value="ADJUSTMENT">تعديل</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الكمية</label>
          <input v-model.number="adjForm.quantity" type="number" class="form-input" min="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظة</label>
          <textarea v-model="adjForm.note" class="form-textarea" />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="adjustModal = false">إلغاء</BaseButton>
        <BaseButton :loading="saving" @click="saveAdjust">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { inventoryApi } from '@/api/inventory'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const stock           = ref([])
const loading         = ref(false)
const saving          = ref(false)
const adjustModal     = ref(false)
const selected        = ref(null)
const search          = ref('')
const lowStockFilter  = ref('')
const errorMessage    = ref('')
const adjForm         = ref({ movement_type: 'IN', quantity: 1, note: '' })

const cols = [
  { key: 'branch_name',   label: 'الفرع' },
  { key: 'variant_name',  label: 'المنتج / الصنف' },
  { key: 'quantity',      label: 'الكمية' },
  { key: 'min_quantity',  label: 'الحد الأدنى' },
  { key: 'is_low_stock',  label: 'الحالة' },
]

const filteredStock = computed(() => {
  let s = stock.value
  if (search.value) s = s.filter(i => i.variant_name.toLowerCase().includes(search.value.toLowerCase()))
  if (lowStockFilter.value === 'true') s = s.filter(i => i.is_low_stock)
  return s
})

async function load() {
  loading.value = true
  try {
    const params = {}
    if (lowStockFilter.value) params.low_stock = lowStockFilter.value
    const { data } = await inventoryApi.listStock(params)
    stock.value = data.results || data
  } finally { loading.value = false }
}

function openAdjust(row) {
  selected.value = row
  errorMessage.value = ''
  adjForm.value  = { movement_type: 'IN', quantity: 1, note: '' }
  adjustModal.value = true
}

async function saveAdjust() {
  saving.value = true
  errorMessage.value = ''
  try {
    await inventoryApi.createMovement({ stock: selected.value.id, ...adjForm.value })
    adjustModal.value = false
    await load()
    selected.value = null
  } catch (error) {
    console.error(error)
    if (error.response?.data) {
      const data = error.response.data
      if (typeof data === 'object') {
        errorMessage.value = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ')
      } else {
        errorMessage.value = String(data)
      }
    } else {
      errorMessage.value = 'حدث خطأ أثناء حفظ البيانات.'
    }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.filters { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }
</style>
