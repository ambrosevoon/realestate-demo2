// src/components/detail/ActionButtons.jsx
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

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
    return () => {
      if (generatingRef.current !== row.id) generatingRef.current = null
    }
  }, [row.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLocked = row.locked === true || row.locked === 'true' || row.locked === '1' || row.locked === 1 || row.status === 'sending'
  const disabled = isLocked || actionLoading

  if (row.status === 'archived') return null
  if (row.status === 'sending') {
    return <div style={{ fontSize: 13, color: '#818cf8' }}>Sending email…</div>
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {row.status === 'pending_review' && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setActionLoading(true)
              onGenerate(row.id).catch(() => {}).finally(() => setActionLoading(false))
            }}
          >
            {actionLoading ? 'Generating…' : 'Generate Draft'}
          </Button>
          <Button size="sm" variant="destructive" disabled={disabled} onClick={() => onNoReply(row.id)}>
            Mark No-Reply
          </Button>
        </>
      )}
      {row.status === 'draft_ready' && (
        <>
          <Button size="sm" variant="default" disabled={disabled} onClick={() => onSend(row.id)}>
            Approve &amp; Send
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setActionLoading(true)
              onGenerate(row.id).catch(() => {}).finally(() => setActionLoading(false))
            }}
          >
            Regenerate Draft
          </Button>
          <Button size="sm" variant="destructive" disabled={disabled} onClick={() => onNoReply(row.id)}>
            Mark No-Reply
          </Button>
        </>
      )}
      {(row.status === 'failed' || row.status === 'send_failed') && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setActionLoading(true)
              onGenerate(row.id).catch(() => {}).finally(() => setActionLoading(false))
            }}
          >
            Retry Draft
          </Button>
          <Button size="sm" variant="destructive" disabled={disabled} onClick={() => onNoReply(row.id)}>
            Mark No-Reply
          </Button>
        </>
      )}
      {(row.status === 'sent' || row.status === 'no_reply_needed') && (
        <Button size="sm" variant="secondary" disabled={disabled} onClick={() => onArchive(row.id)}>
          Archive
        </Button>
      )}
      {(row.status === 'failed' || row.status === 'send_failed' || isLocked) && row.status !== 'sending' && (
        <Button size="sm" variant="secondary" disabled={false} onClick={() => onUnlock(row.id)}>
          Unlock Row
        </Button>
      )}
    </div>
  )
}
