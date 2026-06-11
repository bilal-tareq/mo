import { useMemo } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#7e8a9c', font: { family: 'Cairo', size: 12 } } },
    tooltip: { backgroundColor: '#ffffff', titleColor: '#333f54', bodyColor: '#7e8a9c', borderColor: '#e3e6f0', borderWidth: 1, textDirection: 'rtl' },
  },
  scales: {
    x: { ticks: { color: '#7e8a9c', font: { family: 'Cairo' } }, grid: { color: '#e3e6f0' } },
    y: { ticks: { color: '#7e8a9c', font: { family: 'Cairo' } }, grid: { color: '#e3e6f0' } },
  },
}

export default function BaseChart({ type = 'line', chartData, options = {} }) {
  const mergedOptions = useMemo(() => ({
    ...defaultOptions,
    ...options,
    plugins: { ...defaultOptions.plugins, ...options?.plugins },
  }), [options])

  const Component = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 200 }}>
      <Component data={chartData} options={mergedOptions} />
    </div>
  )
}
