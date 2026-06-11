import './BaseButton.css'

export default function BaseButton({
  id,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  onClick,
  children,
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading',
    block && 'btn-block',
  ].filter(Boolean).join(' ')

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      className={classes}
      onClick={onClick}
    >
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  )
}
