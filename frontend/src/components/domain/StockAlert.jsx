import './StockAlert.css'

export default function StockAlert({ title, message = '', severity = 'warning', icon = '' }) {
  return (
    <div className={`alert-card alert-${severity}`}>
      <span className="alert-icon">{icon}</span>
      <div className="alert-body">
        <div className="alert-title">{title}</div>
        <div className="alert-message">{message}</div>
      </div>
    </div>
  )
}
