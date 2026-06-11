import './BaseCard.css'

export default function BaseCard({ title, hover = false, glass = false, headerActions, footer, children }) {
  const classes = ['card', hover && 'card-hover', glass && 'card-glass'].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {(title || headerActions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {headerActions}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && (
        <div className="card-footer">{footer}</div>
      )}
    </div>
  )
}
