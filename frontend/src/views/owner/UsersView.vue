<template>
  <div>
    <div class="page-header">
      <h1>المستخدمون</h1>
      <BaseButton id="btn-add-user" @click="openAddModal">إضافة مستخدم</BaseButton>
    </div>

    <BaseTable :columns="cols" :rows="users" :loading="loading">
      <template #cell-role="{ value }">
        <span :class="['badge', roleClass(value)]">{{ roleLabel(value) }}</span>
      </template>
      <template #cell-is_active="{ value }">
        <span :class="['badge', value ? 'badge-success' : 'badge-danger']">{{ value ? 'نشط' : 'غير نشط' }}</span>
      </template>
      <template #actions="{ row }">
        <div style="display:flex;gap:.4rem">
          <BaseButton size="sm" variant="secondary" @click="editUser(row)">تعديل</BaseButton>
          <BaseButton size="sm" variant="danger"    @click="deleteUser(row)">حذف</BaseButton>
        </div>
      </template>
    </BaseTable>

    <BaseModal v-model="openModal" :title="editingUser ? 'تعديل مستخدم' : 'مستخدم جديد'">
      <div v-if="errorMessage" style="color: var(--color-danger); background: rgba(255, 77, 106, 0.1); border: 1px solid rgba(255, 77, 106, 0.2); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="form-group"><label class="form-label">اسم المستخدم *</label><input v-model="form.username" class="form-input" required /></div>
      <div class="form-group"><label class="form-label">الاسم الأول</label><input v-model="form.first_name" class="form-input" /></div>
      <div class="form-group"><label class="form-label">الاسم الأخير</label><input v-model="form.last_name" class="form-input" /></div>
      <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input v-model="form.email" class="form-input" type="email" /></div>
      <div v-if="!editingUser" class="form-group"><label class="form-label">كلمة المرور *</label><input v-model="form.password" class="form-input" type="password" required /></div>
      <div class="form-group">
        <label class="form-label">الدور</label>
        <select v-model="form.role" class="form-select">
          <option value="BRANCH_MANAGER">مدير فرع</option>
          <option value="CASHIER">كاشير</option>
        </select>
      </div>
      <div v-if="form.role !== 'OWNER'" class="form-group">
        <label class="form-label">الفرع *</label>
        <select v-model="form.branch" class="form-select" required>
          <option :value="null">اختر الفرع</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="openModal = false">إلغاء</BaseButton>
        <BaseButton :loading="saving" @click="saveUser">حفظ</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/auth'
import { branchesApi } from '@/api/branches'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTable  from '@/components/ui/BaseTable.vue'
import BaseModal  from '@/components/ui/BaseModal.vue'

const users       = ref([])
const branches    = ref([])
const loading     = ref(false)
const openModal   = ref(false)
const saving      = ref(false)
const editingUser = ref(null)
const errorMessage = ref('')
const form        = ref({ username: '', first_name: '', last_name: '', email: '', password: '', role: 'BRANCH_MANAGER', branch: null })

const cols = [
  { key: 'username',    label: 'المستخدم' },
  { key: 'first_name',  label: 'الاسم' },
  { key: 'role',        label: 'الدور' },
  { key: 'branch_name', label: 'الفرع' },
  { key: 'is_active',   label: 'الحالة' },
]

const roleLabel = r => ({ OWNER: 'المالك', BRANCH_MANAGER: 'مدير فرع', CASHIER: 'كاشير' })[r] || r
const roleClass = r => ({ OWNER: 'badge-accent', BRANCH_MANAGER: 'badge-info', CASHIER: 'badge-success' })[r] || ''

async function load() {
  loading.value = true
  try {
    const { data } = await authApi.listUsers()
    users.value = data.results || data
    
    const { data: bData } = await branchesApi.list()
    branches.value = bData.results || bData
  } finally { loading.value = false }
}

function openAddModal() {
  editingUser.value = null
  errorMessage.value = ''
  form.value = { username: '', first_name: '', last_name: '', email: '', password: '', role: 'BRANCH_MANAGER', branch: null }
  openModal.value = true
}

function editUser(u) {
  editingUser.value = u
  errorMessage.value = ''
  form.value = { ...u, password: '' }
  openModal.value = true
}

async function saveUser() {
  saving.value = true
  errorMessage.value = ''
  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password
    // If owner, clear branch
    if (payload.role === 'OWNER') payload.branch = null
    
    if (editingUser.value) {
      await authApi.updateUser(editingUser.value.id, payload)
    } else {
      await authApi.createUser(payload)
    }
    openModal.value = false
    await load()
    editingUser.value = null
    form.value = { username: '', first_name: '', last_name: '', email: '', password: '', role: 'BRANCH_MANAGER', branch: null }
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

async function deleteUser(u) {
  if (confirm(`حذف "${u.username}"؟`)) {
    await authApi.deleteUser(u.id)
    await load()
  }
}

onMounted(load)
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
</style>
