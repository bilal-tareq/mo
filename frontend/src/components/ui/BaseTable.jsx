import './BaseTable.css'

export default function BaseTable({ columns, rows = [], loading = false, renderCell = {}, renderActions }) {
  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="table-loading">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 40, margin: '.5rem 1rem' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="table-wrapper">
        <div className="table-empty"><span>لا توجد بيانات</span></div>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            {renderActions && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={row.id ?? rowIdx}>
              {columns.map(col => (
                <td key={col.key}>
                  {renderCell[col.key]
                    ? renderCell[col.key]({ row, value: row[col.key] })
                    : (row[col.key] ?? '—')}
                </td>
              ))}
              {renderActions && (
                <td>{renderActions({ row })}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
