import { mockRows, mockRow, mockAction } from '../data/mockData.js'

const USE_LIVE = import.meta.env.VITE_USE_LIVE_API === 'true'

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function get(path) {
  const res = await fetch(path)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function listQueue({ status, limit = 50, offset = 0 } = {}) {
  if (!USE_LIVE) return mockRows({ status, limit, offset })
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  return get(`/webhook/re-list?${params}`)
}

export async function getRow(rowId) {
  if (!USE_LIVE) return mockRow(rowId)
  return get(`/webhook/re-row?rowId=${rowId}`)
}

export async function generateDraft(rowId, instructions = '') {
  if (!USE_LIVE) return mockAction('generateDraft', rowId)
  return post('/webhook/re-generate-draft', { rowId, instructions })
}

export async function approveSend(rowId, finalDraft) {
  if (!USE_LIVE) return mockAction('approveSend', rowId)
  const body = { rowId }
  if (finalDraft) body.finalDraft = finalDraft
  return post('/webhook/re-send', body)
}

export async function markNoReply(rowId, notes = '') {
  if (!USE_LIVE) return mockAction('markNoReply', rowId)
  return post('/webhook/re-no-reply', { rowId, notes })
}

export async function archiveRow(rowId, archive_reason = '') {
  if (!USE_LIVE) return mockAction('archiveRow', rowId)
  return post('/webhook/re-archive', { rowId, archive_reason })
}

export async function unlockRow(rowId) {
  if (!USE_LIVE) return mockAction('unlockRow', rowId)
  return post('/webhook/re-unlock', { rowId, resetStatus: 'pending_review' })
}
