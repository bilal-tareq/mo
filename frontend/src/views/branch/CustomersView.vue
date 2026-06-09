<template>
  <div>
    <div class="page-header">
      <h1>العملاء</h1>
      <BaseButton @click="openAddModal">إضافة عميل</BaseButton>
    </div>
    <div style="margin-bottom:1rem">
      <input v-model="search" @input="debouncedLoad" class="form-input" placeholder="ابحث بالاسم أو رقم الهاتف..." style="max-width:360px" />
    </div>
    <BaseTable :columns="cols" :rows="customers" :loading="loading">
      <template #cell-total_purchases="{ value }">{{ Number(value).toLocaleString('ar-EG') }} ج.م</template>
      <template #cell-loyalty_points="{ value }">
        <span class="badge badge-accent">{{ value }} نقطة</span>
      </template>
      <template #actions="{ row }">
        <div style="display:flex;gap:.4rem">
          <BaseButton size="sm" variant="secondary" @click="edit(row)">تعديل</BaseButton>
          <BaseButton size="sm" variant="danger"    @click="del(row)">حذف</BaseButton>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="openModal" :title="editing ? 'تعديل عميل' : 'عميل جديد'">
      <div v-if="errorMessage" style="color: var(--color-danger); background: rgba(255, 77, 106, 0.1); border: 1px solid rgba(255, 77, 106, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="form-group"><label class="form-label">الاسم *</label><input v-model="form.name" class="form-input" required /></div>
      <div class="form-group"><label class="form-label">الهاتف *</label><input v-model="form.phone" class="form-input" required /></div>
      <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input v-model="form.email" class="form-input" type="email" /></div>
      <div class="form-group"><label class="form-label">ملاحظات</label><textarea v-model="form.notes" class="form-textarea" /></div>
      <template #footer>
        <BaseButton variant="secondary" @click="openModal = false">إلغاء</BaseButton>
        <BaseButton :loading="saving" @click="save">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { customersApi } from '@/api/customers'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const customers = ref([])
const loading   = ref(false)
const saving    = ref(false)
const openModal = ref(false)
const editing   = ref(null)
const search    = ref('')
const errorMessage = ref('')
const form      = ref({ name: '', phone: '', email: '', notes: '' })

let timer = null
function debouncedLoad() { clearTimeout(timer); timer = setTimeout(load, 400) }

const cols = [
  { key: 'name',            label: 'الاسم' },
  { key: 'phone',           label: 'الهاتف' },
  { key: 'loyalty_points',  label: 'نقاط الولاء' },
  { key: 'total_purchases', label: 'إجمالي المشتريات' },
]

async function load() {
  loading.value = true
  try { const { data } = await customersApi.list({ search: search.value }); customers.value = data.results || data }
  finally { loading.value = false }
}

function openAddModal() {
  editing.value = null
  errorMessage.value = ''
  form.value = { name: '', phone: '', email: '', notes: '' }
  openModal.value = true
}

function edit(c) {
  editing.value = c
  errorMessage.value = ''
  form.value = { ...c }
  openModal.value = true
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editing.value) {
      await customersApi.update(editing.value.id, form.value)
    } else {
      await customersApi.create(form.value)
    }
    openModal.value = false
    await load()
    editing.value = null
    form.value = { name: '', phone: '', email: '', notes: '' }
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

async function del(c) {
  if (confirm(`حذف "${c.name}"؟`)) { await customersApi.delete(c.id); await load() }
}

onMounted(load)
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
</style>
