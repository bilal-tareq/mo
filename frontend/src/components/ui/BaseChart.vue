<template>
  <div class="chart-wrapper">
    <Line    v-if="type === 'line'"   :data="chartData" :options="mergedOptions" />
    <Bar     v-else-if="type === 'bar'"    :data="chartData" :options="mergedOptions" />
    <Doughnut v-else-if="type === 'doughnut'" :data="chartData" :options="mergedOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

const props = defineProps({
  type:     { type: String,  default: 'line' },
  chartData: { type: Object, required: true },
  options:   { type: Object, default: () => ({}) },
})

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#7b82a0', font: { family: 'Cairo' } } },
    tooltip: { backgroundColor: '#1c2030', titleColor: '#e8eaf0', bodyColor: '#7b82a0', borderColor: '#2a2f42', borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: '#7b82a0' }, grid: { color: '#2a2f42' } },
    y: { ticks: { color: '#7b82a0' }, grid: { color: '#2a2f42' } },
  },
}

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options,
  plugins: { ...defaultOptions.plugins, ...props.options?.plugins },
}))
</script>

<style scoped>
.chart-wrapper { position: relative; width: 100%; height: 100%; min-height: 200px; }
</style>
