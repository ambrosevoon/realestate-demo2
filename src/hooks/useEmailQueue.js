// src/hooks/useEmailQueue.js
import { useState, useEffect, useRef, useCallback } from 'react'

const POLL_INTERVAL = 30_000
import {
  listQueue,
  generateDraft as apiGenerateDraft,
  approveSend as apiApproveSend,
  markNoReply as apiMarkNoReply,
  archiveRow as apiArchiveRow,
  unlockRow as apiUnlockRow,
} from '../api/n8n.js'

export function useEmailQueue() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(false)
  const pollRef = useRef(null)
  const actionInProgressRef = useRef(false)

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await listQueue({ limit: 200 })
      setRows(data.rows || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Initial load + 30s auto-poll
  useEffect(() => {
    refresh()
    pollRef.current = setInterval(() => {
      if (!actionInProgressRef.current) refresh(true)
    }, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [refresh])

  async function withAction(fn) {
    actionInProgressRef.current = true
    setActionInProgress(true)
    setError(null)
    try {
      const result = await fn()
      await refresh(true)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      actionInProgressRef.current = false
      setActionInProgress(false)
    }
  }

  function generateDraft(rowId, instructions) {
    return withAction(() => apiGenerateDraft(String(rowId), instructions))
  }

  function approveSend(rowId, finalDraft) {
    return withAction(() => apiApproveSend(String(rowId), finalDraft))
  }

  function markNoReply(rowId, notes) {
    return withAction(() => apiMarkNoReply(String(rowId), notes))
  }

  function archiveRow(rowId, archive_reason) {
    return withAction(() => apiArchiveRow(String(rowId), archive_reason))
  }

  function unlockRow(rowId) {
    return withAction(() => apiUnlockRow(String(rowId)))
  }

  return {
    rows,
    total,
    loading,
    error,
    actionInProgress,
    refresh,
    generateDraft,
    approveSend,
    markNoReply,
    archiveRow,
    unlockRow,
  }
}
