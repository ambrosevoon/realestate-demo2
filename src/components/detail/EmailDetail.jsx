// src/components/detail/EmailDetail.jsx
import { useState, useEffect } from 'react'
import StatusBadge from '../ui/StatusBadge.jsx'
import ActionButtons from './ActionButtons.jsx'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function EmailDetail({ row, queue }) {
  const [draftText, setDraftText] = useState(row.draft_text || '')

  // Sync draftText when row.draft_text changes (after AI generation)
  useEffect(() => {
    setDraftText(row.draft_text || '')
  }, [row.id, row.draft_text])

  const isGenerating = (row.locked === true || row.locked === 'true') && row.locked_by === 'wfa'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              {row.email_subject || '(no subject)'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 2 }}>
              From: <span style={{ color: '#e2e8f0' }}>{row.email_from_name || row.email_from}</span>
              {row.email_from_name && <span style={{ color: 'var(--muted)' }}> &lt;{row.email_from}&gt;</span>}
            </p>
            {row.customer_phone && (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Phone: <span style={{ color: '#e2e8f0' }}>{row.customer_phone}</span>
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              Received: {formatDate(row.received_at)}
            </p>
          </div>
          <StatusBadge status={row.status} />
        </div>
      </div>

      {/* Original message */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 8 }}>
          Original Message
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
          {row.email_body_full || row.email_body_snippet || '(no content)'}
        </p>
      </div>

      {/* AI Summary */}
      {row.email_summary && (
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(34,211,238,0.03)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 6 }}>
            AI Summary
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{row.email_summary}</p>
        </div>
      )}

      {/* Draft area — show for inbox statuses */}
      {['pending_review', 'draft_ready', 'failed'].includes(row.status) && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 8 }}>
            AI Draft Reply
          </p>
          {isGenerating ? (
            <div style={{
              minHeight: 120, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)'
            }}>
              Generating draft…
            </div>
          ) : (
            <textarea
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              placeholder="Draft will appear here once generated…"
              style={{
                width: '100%', minHeight: 160, padding: 12, borderRadius: 8, resize: 'vertical',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 13, lineHeight: 1.6,
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          )}
        </div>
      )}

      {/* Error message */}
      {row.status === 'failed' && row.error_message && (
        <div style={{ padding: '8px 24px' }}>
          <p style={{ fontSize: 12, color: '#f87171' }}>Error: {row.error_message}</p>
        </div>
      )}

      {/* Sent info */}
      {row.status === 'sent' && row.sent_at && (
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(34,197,94,0.03)' }}>
          <p style={{ fontSize: 12, color: '#4ade80' }}>&#10003; Replied on {formatDate(row.sent_at)}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '16px 24px', flexShrink: 0 }}>
        <ActionButtons
          row={row}
          onGenerate={(id) => queue.generateDraft(id)}
          onSend={(id) => queue.approveSend(id, draftText)}
          onNoReply={(id) => queue.markNoReply(id)}
          onArchive={(id) => queue.archiveRow(id)}
          onUnlock={(id) => queue.unlockRow(id)}
        />
      </div>
    </div>
  )
}
