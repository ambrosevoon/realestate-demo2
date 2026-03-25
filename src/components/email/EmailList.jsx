// src/components/email/EmailList.jsx
import { useState } from 'react'
import StatusBadge from '../ui/StatusBadge.jsx'

const CATEGORY_LABELS = {
  inquiry: 'Enquiry',
  appointment: 'Appointment',
  rental_application: 'Rental',
  financial_docs: 'Finance',
  unrelated: 'Other',
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function EmailList({ rows, activeTab, selectedRowId, onSelect, viewedIds }) {
  const [categoryFilter, setCategoryFilter] = useState(null)

  // Get categories present in current rows
  const categories = [...new Set(rows.map(r => r.email_category).filter(Boolean))]

  // Filter by selected category chip
  const displayed = categoryFilter
    ? rows.filter(r => r.email_category === categoryFilter)
    : rows

  const priorityDot = (priority) => {
    const p = Number(priority)
    if (p <= 1) return 'bg-red-400'
    if (p <= 2) return 'bg-amber-400'
    if (p <= 3) return 'bg-blue-400'
    return 'bg-gray-500'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setCategoryFilter(null)}
            className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              background: !categoryFilter ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
              color: !categoryFilter ? 'var(--accent)' : 'var(--muted)',
              border: `1px solid ${!categoryFilter ? 'rgba(34,211,238,0.3)' : 'var(--border)'}`,
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: categoryFilter === cat ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
                color: categoryFilter === cat ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${categoryFilter === cat ? 'rgba(34,211,238,0.3)' : 'var(--border)'}`,
              }}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-2 overflow-auto">
        {displayed.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>
            No emails in this view.
          </div>
        ) : (
          displayed.map(row => {
            const isSelected = String(selectedRowId) === String(row.id)
            const isUnviewed = !viewedIds?.has(String(row.id)) && row.status === 'pending_review'

            return (
              <div
                key={row.id}
                onClick={() => onSelect(row.id)}
                className="px-4 py-3 rounded-lg cursor-pointer transition-all text-sm"
                style={{
                  background: isSelected
                    ? 'rgba(34,211,238,0.07)'
                    : isUnviewed
                      ? 'rgba(236,72,153,0.04)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    isSelected
                      ? 'rgba(34,211,238,0.25)'
                      : isUnviewed
                        ? 'rgba(236,72,153,0.2)'
                        : 'var(--border)'
                  }`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    {/* Priority dot */}
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot(row.priority)}`} />
                    <div className="min-w-0">
                      <div className="font-medium truncate" style={{ color: isUnviewed ? '#f1f5f9' : 'var(--text)' }}>
                        {row.email_subject || '(no subject)'}
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                        {row.email_from_name || row.email_from}
                        {row.email_category && (
                          <span className="ml-1.5 px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            {CATEGORY_LABELS[row.email_category] || row.email_category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={row.status} />
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {formatRelativeTime(row.received_at)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
