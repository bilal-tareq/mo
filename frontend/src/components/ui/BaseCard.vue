<template>
  <div :class="['card', { 'card-hover': hover, 'card-glass': glass }]">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
        <slot name="header-actions" />
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String,  default: '' },
  hover: { type: Boolean, default: false },
  glass: { type: Boolean, default: false },
})
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition);
}
.card-hover:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.card-glass {
  background: rgba(21,24,32,.7);
  backdrop-filter: blur(12px);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}
.card-title { font-size: 1rem; font-weight: 600; }
.card-body  { padding: 1.25rem; }
.card-footer {
  padding: .75rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-2);
}
</style>
