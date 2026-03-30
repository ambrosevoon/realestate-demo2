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

const label = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 8,
}

export default function EmailDetail({ row, queue }) {
  const [draftText, setDraftText] = useState(row.draft_text || '')

  useEffect(() => {
    setDraftText(row.draft_text || '')
  }, [row.id, row.draft_text])

  const isGenerating = (row.locked === true || row.locked === 'true' || row.locked === '1' || row.locked === 1) && row.locked_by === 'wfa'

  return (
    <div className="animate-fade-slide-up" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
              {row.email_subject || '(no subject)'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 2 }}>
              From: <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{row.email_from_name || row.email_from}</span>
              {row.email_from_name && <span style={{ color: 'var(--muted-foreground)' }}> &lt;{row.email_from}&gt;</span>}
            </p>
            {row.customer_phone && (
              <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                Phone: <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{row.customer_phone}</span>
              </p>
            )}
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
              Received: {formatDate(row.received_at)}
            </p>
          </div>
          <StatusBadge status={row.status} />
        </div>
      </div>

      {/* ── Original message ───────────────────────── */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ ...label, color: 'var(--muted-foreground)' }}>
          Original Message
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--foreground)', whiteSpace: 'pre-wrap' }}>
          {row.email_body_full || row.email_body_snippet || '(no content)'}
        </p>
      </div>

      {/* ── AI Summary ─────────────────────────────── */}
      {row.email_summary && (
        <div className="animate-fade-in" style={{
          padding: '12px 24px', borderBottom: '1px solid var(--border)',
          background: 'rgba(147,51,234,0.05)', animationDelay: '0.08s',
        }}>
          <p style={{ ...label, color: 'var(--dash-accent)' }}>AI Summary</p>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{row.email_summary}</p>
        </div>
      )}

      {/* ── Sent confirmation ──────────────────────── */}
      {row.status === 'sent' && row.sent_at && (
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(34,197,94,0.05)' }}>
          <p style={{ fontSize: 12, color: '#16a34a' }}>&#10003; Replied on {formatDate(row.sent_at)}</p>
        </div>
      )}

      {/* ── Error message ──────────────────────────── */}
      {(row.status === 'failed' || row.status === 'send_failed') && row.error_message && (
        <div style={{ padding: '8px 24px' }}>
          <p style={{ fontSize: 12, color: '#dc2626' }}>Error: {row.error_message}</p>
        </div>
      )}

      {/* ── Draft area + Actions (together) ────────── */}
      {['pending_review', 'draft_ready', 'failed', 'send_failed'].includes(row.status) && (
        <div className="animate-fade-in" style={{ padding: '16px 24px', flex: 1, animationDelay: '0.14s', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ ...label, color: 'var(--muted-foreground)' }}>
            AI Draft Reply
          </p>

          {row.status === 'sending' ? (
            <div style={{ fontSize: 13, color: 'var(--dash-accent)' }}>Sending email…</div>
          ) : isGenerating ? (
            <div className="shimmer-box" style={{
              minHeight: 'clamp(120px, 25vh, 240px)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)', fontSize: 13, color: 'var(--muted-foreground)',
            }}>
              Generating draft…
            </div>
          ) : (
            <textarea
              className="draft-textarea"
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              placeholder="Draft will appear here once generated…"
              style={{
                width: '100%', minHeight: 'clamp(160px, 30vh, 320px)', padding: 12, borderRadius: 8, resize: 'vertical',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--foreground)', fontSize: 13, lineHeight: 1.6,
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          )}

          {/* Buttons sit directly below the textarea */}
          <ActionButtons
            row={row}
            onGenerate={(id) => queue.generateDraft(id)}
            onSend={(id) => queue.approveSend(id, draftText)}
            onNoReply={(id) => queue.markNoReply(id)}
            onArchive={(id) => queue.archiveRow(id)}
            onUnlock={(id) => queue.unlockRow(id)}
          />
        </div>
      )}

      {/* ── Archive / no-reply actions ─────────────── */}
      {['sent', 'no_reply_needed'].includes(row.status) && (
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
      )}
    </div>
  )
}
