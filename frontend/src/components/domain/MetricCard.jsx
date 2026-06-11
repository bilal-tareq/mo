import { useMemo } from 'react'
import './MetricCard.css'

export default function MetricCard({ label, value, type = 'orange', format = 'number', sparklineData = [10, 15, 8, 20, 18, 25] }) {
  const formattedValue = useMemo(() => {
    if (format === 'currency') return `${Number(value).toLocaleString('ar-EG')} ج.م`
    if (format === 'percent') return `${value}%`
    return Number(value).toLocaleString('ar-EG')
  }, [value, format])

  const lastUpdated = useMemo(() => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'م' : 'ص'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${hours}:${minutes} ${ampm}`
  }, [])

  const sparklinePath = useMemo(() => {
    const data = sparklineData
    if (!data || data.length < 2) return 'M 0 15 L 100 15'
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 30 - ((val - min) / range) * 22 - 4
      return `${x} ${y}`
    })

    return `M ${points.join(' L ')}`
  }, [sparklineData])

  return (
    <div className={`adminty-card ${type}`}>
      <div className="metric-card-body">
        <div className="card-main">
          <div className="card-info">
            <div className="card-value">{formattedValue}</div>
            <div className="card-label">{label}</div>
          </div>
          <div className="card-sparkline">
            <svg className="sparkline-svg" viewBox="0 0 100 30" width="80" height="24">
              <path
                d={sparklinePath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="card-footer-metric">
          <span className="footer-icon"></span>
          <span className="footer-text">تحديث: {lastUpdated}</span>
        </div>
      </div>
    </div>
  )
}
