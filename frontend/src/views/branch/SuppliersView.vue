<template>
  <div>
    <div class="page-header">
      <h1>الموردون</h1>
      <BaseButton @click="openAddModal">إضافة مورد</BaseButton>
    </div>

    <BaseTable :columns="cols" :rows="suppliers" :loading="loading">
      <template #cell-is_active="{ value }">
        <span :class="['badge', value ? 'badge-success' : 'badge-danger']">{{ value ? 'نشط' : 'غير نشط' }}</span>
      </template>
      <template #actions="{ row }">
        <div style="display:flex;gap:.4rem">
          <BaseButton size="sm" variant="secondary" @click="edit(row)">تعديل</BaseButton>
          <BaseButton size="sm" variant="danger"    @click="del(row)">حذف</BaseButton>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="openModal" :title="editing ? 'تعديل مورد' : 'مورد جديد'">
      <div v-if="errorMessage" style="color: var(--color-danger); background: rgba(255, 77, 106, 0.1); border: 1px solid rgba(255, 77, 106, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="form-group"><label class="form-label">الاسم *</label><input v-model="form.name" class="form-input" required /></div>
      <div class="form-group"><label class="form-label">المسؤول</label><input v-model="form.contact_person" class="form-input" /></div>
      <div class="form-group"><label class="form-label">الهاتف</label><input v-model="form.phone" class="form-input" /></div>
      <div class="form-group"><label class="form-label">البريد</label><input v-model="form.email" class="form-input" type="email" /></div>
      <div class="form-group"><label class="form-label">العنوان</label><textarea v-model="form.address" class="form-textarea" /></div>
      <template #footer>
        <BaseButton variant="secondary" @click="openModal = false">إلغاء</BaseButton>
        <BaseButton :loading="saving" @click="save">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { suppliersApi } from '@/api/suppliers'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const suppliers = ref([])
const loading   = ref(false)
const saving    = ref(false)
const openModal = ref(false)
const editing   = ref(null)
const errorMessage = ref('')
const form      = ref({ name: '', contact_person: '', phone: '', email: '', address: '' })

const cols = [
  { key: 'name',           label: 'المورد' },
  { key: 'contact_person', label: 'المسؤول' },
  { key: 'phone',          label: 'الهاتف' },
  { key: 'email',          label: 'البريد' },
  { key: 'is_active',      label: 'الحالة' },
]

async function load() {
  loading.value = true
  try { const { data } = await suppliersApi.list(); suppliers.value = data.results || data }
  finally { loading.value = false }
}

function openAddModal() {
  editing.value = null
  errorMessage.value = ''
  form.value = { name: '', contact_person: '', phone: '', email: '', address: '' }
  openModal.value = true
}

function edit(s) {
  editing.value = s
  errorMessage.value = ''
  form.value = { ...s }
  openModal.value = true
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editing.value) {
      await suppliersApi.update(editing.value.id, form.value)
    } else {
      await suppliersApi.create(form.value)
    }
    openModal.value = false
    await load()
    editing.value = null
    form.value = { name: '', contact_person: '', phone: '', email: '', address: '' }
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

async function del(s) {
  if (confirm(`حذف "${s.name}"؟`)) { await suppliersApi.delete(s.id); await load() }
}

onMounted(load)
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
</style>
