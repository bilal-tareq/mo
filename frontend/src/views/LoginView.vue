<template>
  <div class="login-page">
    <div class="login-bg" />
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <span class="logo-emoji"></span>
        <h1 class="logo-name">Fashion Chain</h1>
        <p class="logo-sub">نظام إدارة سلسلة المتاجر</p>
      </div>

      <!-- Form -->
      <form id="login-form" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="login-username">اسم المستخدم</label>
          <input
            id="login-username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="أدخل اسم المستخدم"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-password">كلمة المرور</label>
          <input
            id="login-password"
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            class="form-input"
            placeholder="أدخل كلمة المرور"
            required
            autocomplete="current-password"
          />
          <button type="button" class="pass-toggle" @click="showPass = !showPass">
            {{ showPass ? '🙈' : '👁️' }}
          </button>
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <button
          id="login-submit"
          type="submit"
          class="login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="btn-spinner" />
          <span v-else>تسجيل الدخول</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()
const form    = ref({ username: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPass = ref(false)

async function handleLogin() {
  loading.value = true
  error.value   = ''
  try {
    await login(form.value)
  } catch (e) {
    error.value = e.response?.data?.detail || 'اسم المستخدم أو كلمة المرور غير صحيحة'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 20%, rgba(124,106,255,.15) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, rgba(255,106,157,.1) 0%, transparent 50%),
              var(--color-bg);
}

.login-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-lg);
  animation: fadeIn .4s ease;
}

.login-logo { text-align: center; margin-bottom: 2rem; }
.logo-emoji { font-size: 3rem; display: block; margin-bottom: .5rem; }
.logo-name  { font-size: 1.6rem; font-weight: 800; color: var(--color-accent); margin-bottom: .3rem; }
.logo-sub   { color: var(--color-text-muted); font-size: .9rem; }

.login-form { display: flex; flex-direction: column; gap: .25rem; }

.form-group { position: relative; }

.pass-toggle {
  position: absolute;
  left: .75rem;
  top: 2.1rem;
  background: none; border: none;
  cursor: pointer; font-size: 1rem;
}

.login-error {
  background: rgba(255,77,106,.1);
  border: 1px solid rgba(255,77,106,.3);
  color: var(--color-danger);
  border-radius: var(--radius-sm);
  padding: .6rem 1rem;
  font-size: .85rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: .85rem;
  background: linear-gradient(135deg, var(--color-accent), #a855f7);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: .5rem;
  transition: all var(--transition);
  display: flex; align-items: center; justify-content: center; gap: .5rem;
}
.login-btn:hover:not(:disabled) { opacity: .9; box-shadow: 0 0 20px rgba(124,106,255,.4); }
.login-btn:disabled { opacity: .6; cursor: not-allowed; }

.btn-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
