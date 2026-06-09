<template>
  <div>
    <div class="page-header">
      <h1>إدارة الفروع</h1>
      <BaseButton id="btn-add-branch" icon="+" @click="openAddModal">إضافة فرع</BaseButton>
    </div>

    <div class="grid-3" style="margin-top:1.5rem">
      <div
        v-for="branch in branches"
        :key="branch.id"
        class="branch-card"
        :class="{ inactive: !branch.is_active }"
      >
        <div class="branch-card-header">
          <span class="branch-icon">🏪</span>
          <div>
            <div class="branch-name">{{ branch.name }}</div>
            <span :class="['badge', branch.is_active ? 'badge-success' : 'badge-danger']">
              {{ branch.is_active ? 'نشط' : 'غير نشط' }}
            </span>
          </div>
        </div>
        <div class="branch-info">
          <div v-if="branch.phone"> {{ branch.phone }}</div>
          <div v-if="branch.address"> {{ branch.address }}</div>
          <div>{{ branch.staff_count }} موظف</div>
          <div v-if="branch.settings"> ضريبة {{ branch.settings.tax_rate }}%</div>
        </div>
        <div class="branch-actions">
          <BaseButton variant="secondary" size="sm" @click="editBranch(branch)">تعديل</BaseButton>
          <BaseButton variant="danger"    size="sm" @click="confirmDelete(branch)">حذف</BaseButton>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal v-model="openModal" :title="editingBranch ? 'تعديل فرع' : 'إضافة فرع جديد'">
      <div v-if="errorMessage" style="color: var(--color-danger); background: rgba(255, 77, 106, 0.1); border: 1px solid rgba(255, 77, 106, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <label class="form-label">اسم الفرع *</label>
        <input v-model="form.name"    class="form-input" required />
      </div>
      <div class="form-group">
        <label class="form-label">العنوان</label>
        <input v-model="form.address" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">الهاتف</label>
        <input v-model="form.phone"   class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">البريد الإلكتروني</label>
        <input v-model="form.email"   class="form-input" type="email" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="openModal = false">إلغاء</BaseButton>
        <BaseButton :loading="saving" @click="saveBranch">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { branchesApi } from '@/api/branches'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const branches      = ref([])
const openModal     = ref(false)
const saving        = ref(false)
const editingBranch = ref(null)
const errorMessage  = ref('')
const form          = ref({ name: '', address: '', phone: '', email: '' })

async function load() {
  const { data } = await branchesApi.list()
  branches.value = data.results || data
}

function openAddModal() {
  editingBranch.value = null
  errorMessage.value = ''
  form.value = { name: '', address: '', phone: '', email: '' }
  openModal.value = true
}

function editBranch(b) {
  editingBranch.value = b
  errorMessage.value = ''
  form.value = { name: b.name, address: b.address, phone: b.phone, email: b.email }
  openModal.value = true
}

async function saveBranch() {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingBranch.value) {
      await branchesApi.update(editingBranch.value.id, form.value)
    } else {
      await branchesApi.create(form.value)
    }
    openModal.value = false
    await load()
    editingBranch.value = null
    form.value = { name: '', address: '', phone: '', email: '' }
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

async function confirmDelete(b) {
  if (confirm(`حذف فرع "${b.name}"؟`)) {
    await branchesApi.delete(b.id)
    await load()
  }
}

onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.branch-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  transition: all var(--transition);
}
.branch-card:hover { border-color: var(--color-accent); box-shadow: var(--shadow-sm); }
.branch-card.inactive { opacity: .6; }
.branch-card-header { display: flex; gap: .75rem; align-items: flex-start; margin-bottom: 1rem; }
.branch-icon { font-size: 2rem; }
.branch-name { font-weight: 700; font-size: 1rem; margin-bottom: .3rem; }
.branch-info { display: flex; flex-direction: column; gap: .35rem; font-size: .85rem; color: var(--color-text-muted); margin-bottom: 1rem; }
.branch-actions { display: flex; gap: .5rem; }
</style>
