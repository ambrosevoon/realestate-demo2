// src/components/detail/ActionButtons.jsx
import { useEffect, useRef, useState } from 'react'

export default function ActionButtons({ row, onGenerate, onSend, onNoReply, onArchive, onUnlock }) {
  const generatingRef = useRef(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Auto-trigger draft generation when row is pending_review with no draft
  useEffect(() => {
    if (row.status === 'pending_review' && !row.draft_text && generatingRef.current !== row.id) {
      generatingRef.current = row.id
      setActionLoading(true)
      onGenerate(row.id).catch(() => {}).finally(() => {
        setActionLoading(false)
      })
    }
    // When row changes to a different row, reset flag
    return () => {
      if (generatingRef.current !== row.id) generatingRef.current = null
    }
  }, [row.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLocked = row.locked === true || row.locked === 'true' || row.locked === '1' || row.locked === 1 || row.status === 'sending'
  const disabled = isLocked || actionLoading

  function Btn({ label, onClick, variant = 'default', fullWidth = false }) {
    const styles = {
      primary: { background: '#22d3ee', color: '#000', border: 'none' },
      danger:  { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
      default: { background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' },
    }
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...styles[variant],
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'opacity 0.15s',
          width: fullWidth ? '100%' : undefined,
        }}
      >
        {label}
      </button>
    )
  }

  if (row.status === 'archived') return null
  if (row.status === 'sending') {
    return <div style={{ fontSize: 13, color: '#818cf8' }}>Sending email…</div>
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {row.status === 'pending_review' && (
        <>
          <Btn
            label={actionLoading ? 'Generating…' : 'Generate Draft'}
            onClick={() => {
              setActionLoading(true)
              onGenerate(row.id).catch(() => {}).finally(() => setActionLoading(false))
            }}
          />
          <Btn label="Mark No-Reply" onClick={() => onNoReply(row.id)} variant="danger" />
        </>
      )}
      {row.status === 'draft_ready' && (
        <>
          <Btn label="Approve & Send" onClick={() => onSend(row.id)} variant="primary" />
          <Btn
            label="Regenerate Draft"
            onClick={() => {
              setActionLoading(true)
              onGenerate(row.id).catch(() => {}).finally(() => setActionLoading(false))
            }}
          />
          <Btn label="Mark No-Reply" onClick={() => onNoReply(row.id)} variant="danger" />
        </>
      )}
      {(row.status === 'failed' || row.status === 'send_failed') && (
        <>
          <Btn
            label="Retry Draft"
            onClick={() => {
              setActionLoading(true)
              onGenerate(row.id).catch(() => {}).finally(() => setActionLoading(false))
            }}
          />
          <Btn label="Mark No-Reply" onClick={() => onNoReply(row.id)} variant="danger" />
        </>
      )}
      {(row.status === 'sent' || row.status === 'no_reply_needed') && (
        <Btn label="Archive" onClick={() => onArchive(row.id)} />
      )}
      {(row.status === 'failed' || row.status === 'send_failed' || isLocked) && row.status !== 'sending' && (
        <Btn label="Unlock Row" onClick={() => onUnlock(row.id)} />
      )}
    </div>
  )
}
