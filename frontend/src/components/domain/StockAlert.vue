<template>
  <div class="alert-card" :class="`alert-${severity}`">
    <span class="alert-icon">{{ icon }}</span>
    <div class="alert-body">
      <div class="alert-title">{{ title }}</div>
      <div class="alert-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title:    { type: String, required: true },
  message:  { type: String, default: '' },
  severity: { type: String, default: 'warning' }, // warning | danger | info
  icon:     { type: String, default: '' },
})
</script>

<style scoped>
.alert-card {
  display: flex; gap: .75rem; align-items: flex-start;
  padding: .85rem 1rem;
  border-radius: var(--radius-sm);
  border-width: 1px; border-style: solid;
  font-size: .88rem;
}
.alert-warning { background: rgba(245,166,35,.1);  border-color: rgba(245,166,35,.3); }
.alert-danger  { background: rgba(255,77,106,.1);   border-color: rgba(255,77,106,.3); }
.alert-info    { background: rgba(56,199,255,.1);   border-color: rgba(56,199,255,.3); }
.alert-icon    { font-size: 1.2rem; flex-shrink: 0; margin-top: .1rem; }
.alert-title   { font-weight: 700; margin-bottom: .2rem; }
.alert-message { color: var(--color-text-muted); font-size: .82rem; }
</style>
