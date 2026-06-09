<template>
  <div :class="['adminty-card', type]">
    <div class="card-body">
      <div class="card-main">
        <div class="card-info">
          <div class="card-value">{{ formattedValue }}</div>
          <div class="card-label">{{ label }}</div>
        </div>
        <!-- Sparkline -->
        <div class="card-sparkline">
          <svg class="sparkline-svg" viewBox="0 0 100 30" width="80" height="24">
            <path
              :d="sparklinePath"
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
      <div class="card-footer">
        <span class="footer-icon"></span>
        <span class="footer-text">تحديث: {{ lastUpdated }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label:  { type: String,  required: true },
  value:  { type: [Number, String], required: true },
  type:   { type: String,  default: 'orange' }, // orange | green | pink | teal
  format: { type: String,  default: 'number' }, // number | currency | percent
  sparklineData: { type: Array, default: () => [10, 15, 8, 20, 18, 25] }
})

const formattedValue = computed(() => {
  if (props.format === 'currency') return `${Number(props.value).toLocaleString('ar-EG')} ج.م`
  if (props.format === 'percent')  return `${props.value}%`
  return Number(props.value).toLocaleString('ar-EG')
})

const lastUpdated = computed(() => {
  const now = new Date()
  let hours = now.getHours()
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'م' : 'ص'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`
})

// Create an SVG path from sparkline data array
const sparklinePath = computed(() => {
  const data = props.sparklineData
  if (!data || data.length < 2) return 'M 0 15 L 100 15'
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * 100
    // invert y because SVG y goes down
    const y = 30 - ((val - min) / range) * 22 - 4
    return `${x} ${y}`
  })
  
  return `M ${points.join(' L ')}`
})
</script>

<style scoped>
.adminty-card {
  border-radius: 5px;
  color: #ffffff;
  box-shadow: 0 1px 20px 0 rgba(69,90,100,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  border: none;
}
.adminty-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 25px 0 rgba(69,90,100,0.15);
}

/* Gradients */
.orange { background: linear-gradient(45deg, #fe5d70, #fe9365); }
.green  { background: linear-gradient(45deg, #01a9ac, #01dbdf); }
.pink   { background: linear-gradient(45deg, #fe9365, #fe5d70); }
.teal   { background: linear-gradient(45deg, #0ac282, #0df3a3); }

.card-body {
  padding: 20px 24px;
}

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.card-label {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-top: 4px;
  font-weight: 500;
}

.card-sparkline {
  opacity: 0.85;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  opacity: 0.9;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 10px;
}

.footer-icon {
  font-size: 0.8rem;
}
</style>
