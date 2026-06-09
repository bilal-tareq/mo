<template>
  <div>
    <div class="page-header">
      <h1>المنتجات</h1>
      <BaseButton id="btn-add-product" @click="openAddModal">إضافة منتج</BaseButton>
    </div>
    <div style="margin-bottom:1rem">
      <input v-model="search" @input="debouncedLoad" class="form-input" placeholder="ابحث بالاسم أو SKU أو الباركود..." style="max-width:360px" />
    </div>

    <BaseTable :columns="cols" :rows="products" :loading="loading">
      <template #cell-is_active="{ value }">
        <span :class="['badge', value ? 'badge-success' : 'badge-danger']">{{ value ? 'نشط' : 'معطل' }}</span>
      </template>
      <template #cell-image="{ value }">
        <img v-if="value" :src="value" style="width:36px;height:36px;object-fit:cover;border-radius:6px" />
        <span v-else>—</span>
      </template>
      <template #actions="{ row }">
        <div style="display:flex;gap:.4rem">
          <BaseButton size="sm" variant="secondary" @click="edit(row)">تعديل</BaseButton>
          <BaseButton size="sm" variant="danger"    @click="del(row)">حذف</BaseButton>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="openModal" :title="editing ? 'تعديل منتج' : 'منتج جديد'">
      <div v-if="errorMessage" style="color: var(--color-danger); background: rgba(255, 77, 106, 0.1); border: 1px solid rgba(255, 77, 106, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="form-group"><label class="form-label">الاسم *</label><input v-model="form.name" class="form-input" required /></div>
      <div class="form-group">
        <label class="form-label">التصنيف</label>
        <select v-model="form.category" class="form-select">
          <option :value="null">— بدون تصنيف —</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">الوصف</label><textarea v-model="form.description" class="form-textarea" /></div>
      <div class="form-group">
        <label class="form-label">الحالة</label>
        <select v-model="form.is_active" class="form-select">
          <option :value="true">نشط</option>
          <option :value="false">معطل</option>
        </select>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="openModal = false">إلغاء</BaseButton>
        <BaseButton :loading="saving" @click="save">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productsApi } from '@/api/products'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const products   = ref([])
const categories = ref([])
const loading    = ref(false)
const saving     = ref(false)
const openModal  = ref(false)
const editing    = ref(null)
const search     = ref('')
const errorMessage = ref('')
const form       = ref({ name: '', category: null, description: '', is_active: true })

let debounceTimer = null
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 400)
}

const cols = [
  { key: 'image',         label: 'صورة' },
  { key: 'name',          label: 'الاسم' },
  { key: 'category_name', label: 'التصنيف' },
  { key: 'is_active',     label: 'الحالة' },
]

async function load() {
  loading.value = true
  try {
    const { data } = await productsApi.list({ search: search.value })
    products.value = data.results || data
  } finally { loading.value = false }
}

async function loadCategories() {
  const { data } = await productsApi.listCategories()
  categories.value = data.results || data
}

function openAddModal() {
  editing.value = null
  errorMessage.value = ''
  form.value = { name: '', category: null, description: '', is_active: true }
  openModal.value = true
}

function edit(p) {
  editing.value = p
  errorMessage.value = ''
  form.value = { ...p }
  openModal.value = true
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editing.value) {
      await productsApi.update(editing.value.id, form.value)
    } else {
      await productsApi.create(form.value)
    }
    openModal.value = false
    await load()
    editing.value = null
    form.value = { name: '', category: null, description: '', is_active: true }
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

async function del(p) {
  if (confirm(`حذف "${p.name}"؟`)) { await productsApi.delete(p.id); await load() }
}

onMounted(() => { load(); loadCategories() })
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
</style>
