import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="nf-content">
        <div className="nf-code">404</div>
        <h1>الصفحة غير موجودة</h1>
        <p className="text-muted">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link to="/" className="btn btn-primary btn-md" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
