<template>
  <div class="metric-card" :style="{ '--accent': color }">
    <div class="metric-icon">{{ icon }}</div>
    <div class="metric-content">
      <div class="metric-label">{{ label }}</div>
      <div class="metric-value">{{ formattedValue }}</div>
      <div v-if="trend !== undefined" :class="['metric-trend', trend >= 0 ? 'up' : 'down']">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  label:  { type: String,  required: true },
  value:  { type: [Number, String], required: true },
  icon:   { type: String,  default: '' },
  color:  { type: String,  default: 'var(--color-accent)' },
  trend:  { type: Number,  default: undefined },
  format: { type: String,  default: 'number' }, // number | currency | percent
})

const formattedValue = computed(() => {
  if (props.format === 'currency') return `${Number(props.value).toLocaleString('ar-EG')} ج.م`
  if (props.format === 'percent')  return `${props.value}%`
  return Number(props.value).toLocaleString('ar-EG')
})
</script>

<style scoped>
.metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}
.metric-card::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 4px; height: 100%;
  background: var(--accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.metric-card:hover { border-color: var(--accent); box-shadow: 0 0 20px rgba(124,106,255,.1); }
.metric-icon {
  width: 48px; height: 48px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.metric-label { font-size: .8rem; color: var(--color-text-muted); margin-bottom: .25rem; }
.metric-value { font-size: 1.5rem; font-weight: 800; }
.metric-trend { font-size: .75rem; font-weight: 600; margin-top: .2rem; }
.metric-trend.up   { color: var(--color-success); }
.metric-trend.down { color: var(--color-danger); }
</style>
