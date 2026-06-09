<template>
  <button
    :id="id"
    :type="type"
    :disabled="disabled || loading"
    :class="['btn', `btn-${variant}`, `btn-${size}`, { 'btn-loading': loading, 'btn-block': block }]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner" />
    <slot />
  </button>
</template>

<script setup>
defineProps({
  id:       { type: String,  default: () => `btn-${Math.random().toString(36).slice(2)}` },
  type:     { type: String,  default: 'button' },
  variant:  { type: String,  default: 'primary' },  // primary | secondary | danger | ghost | success
  size:     { type: String,  default: 'md' },        // sm | md | lg
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
  block:    { type: Boolean, default: false },
})
defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  outline: none;
}
.btn:disabled { opacity: .5; cursor: not-allowed; }

/* Sizes */
.btn-sm { padding: .35rem .8rem;  font-size: .8rem;  }
.btn-md { padding: .55rem 1.2rem; font-size: .9rem;  }
.btn-lg { padding: .75rem 1.6rem; font-size: 1rem;   }

/* Block */
.btn-block { width: 100%; }

/* Variants */
.btn-primary   { background: var(--color-accent);  color: #fff; }
.btn-primary:hover:not(:disabled)   { background: #9882ff; box-shadow: 0 0 16px rgba(124,106,255,.4); }

.btn-secondary { background: var(--color-surface-2); color: var(--color-text); border: 1.5px solid var(--color-border); }
.btn-secondary:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }

.btn-danger    { background: var(--color-danger);  color: #fff; }
.btn-danger:hover:not(:disabled)    { background: #ff2d50; }

.btn-success   { background: var(--color-success); color: #fff; }
.btn-success:hover:not(:disabled)   { background: #18b865; }

.btn-ghost     { background: transparent; color: var(--color-text-muted); }
.btn-ghost:hover:not(:disabled)     { background: var(--color-surface-2); color: var(--color-text); }

/* Spinner */
.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
