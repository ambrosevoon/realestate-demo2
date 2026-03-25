const SEED_ROWS = [
  {
    id: '1',
    gmail_message_id: 'mock-msg-001',
    gmail_thread_id: 'mock-thread-001',
    email_from: 'sarah.chen@gmail.com',
    email_from_name: 'Sarah Chen',
    email_subject: 'Interested in 13 Plunkett Turn — Price Guide?',
    email_body_snippet: 'Hi, I came across your listing for 13 Plunkett Turn and I\'m very interested. Could you please let me know the price guide and when the next inspection is scheduled?',
    email_body_full: 'Hi,\n\nI came across your listing for 13 Plunkett Turn, Canning Vale and I\'m very interested in the property. It looks perfect for my family.\n\nCould you please let me know:\n1. The price guide\n2. When the next inspection is scheduled\n3. Whether there is off-street parking\n\nMy phone is 0412 555 001.\n\nThank you,\nSarah Chen',
    received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Sarah Chen',
    customer_email: 'sarah.chen@gmail.com',
    customer_phone: '0412 555 001',
    email_category: 'inquiry',
    email_urgency: 'high',
    email_summary: 'Buyer enquiring about price guide, inspection times, and parking for 13 Plunkett Turn.',
    status: 'pending_review',
    priority: '2',
    draft_text: '',
    locked: 'false',
    locked_by: '',
    lock_expires_at: '',
    error_message: '',
    error_count: '0',
    draft_generation_attempts: '0',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    gmail_message_id: 'mock-msg-002',
    gmail_thread_id: 'mock-thread-002',
    email_from: 'james.wilson@outlook.com',
    email_from_name: 'James Wilson',
    email_subject: 'Inspection booking — Saturday 10am',
    email_body_snippet: 'Hi, I would like to book an inspection for 13 Plunkett Turn this Saturday at 10am if possible. My name is James Wilson and my phone is 0423 555 002.',
    email_body_full: 'Hi,\n\nI would like to book an inspection for 13 Plunkett Turn this Saturday at 10am if possible.\n\nMy name is James Wilson and my phone is 0423 555 002.\n\nPlease confirm if this time works.\n\nThanks,\nJames',
    received_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    customer_name: 'James Wilson',
    customer_email: 'james.wilson@outlook.com',
    customer_phone: '0423 555 002',
    email_category: 'appointment',
    email_urgency: 'high',
    email_summary: 'Buyer wants to book a Saturday 10am inspection for 13 Plunkett Turn.',
    status: 'draft_ready',
    priority: '2',
    draft_text: 'Dear James,\n\nThank you for your interest in 13 Plunkett Turn, Canning Vale.\n\nI\'m delighted to confirm your inspection for this Saturday at 10:00 AM. The property is located at 13 Plunkett Turn, Canning Vale WA 6155.\n\nPlease feel free to contact me if you have any questions prior to the inspection.\n\nLooking forward to meeting you.\n\nKind regards,\nSenior Sales Agent | SmartFlow Automation',
    locked: 'false',
    locked_by: '',
    lock_expires_at: '',
    error_message: '',
    error_count: '0',
    draft_generation_attempts: '1',
    draft_generated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    gmail_message_id: 'mock-msg-003',
    gmail_thread_id: 'mock-thread-003',
    email_from: 'priya.sharma@hotmail.com',
    email_from_name: 'Priya Sharma',
    email_subject: 'Rental application — 5 Banksia Street',
    email_body_snippet: 'Hi, I would like to apply for the rental property at 5 Banksia Street. I am a nurse working full-time at Fiona Stanley Hospital. Please find attached my rental application.',
    email_body_full: 'Hi,\n\nI would like to apply for the rental property at 5 Banksia Street, Bull Creek.\n\nAbout me:\n- Full-time nurse at Fiona Stanley Hospital\n- Income: $85,000 per year\n- No pets\n- Non-smoker\n\nPlease find my rental application and references attached.\n\nKind regards,\nPriya Sharma\n0434 555 003',
    received_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Priya Sharma',
    customer_email: 'priya.sharma@hotmail.com',
    customer_phone: '0434 555 003',
    email_category: 'rental_application',
    email_urgency: 'medium',
    email_summary: 'Rental application for 5 Banksia Street from Priya Sharma, full-time nurse, income $85k.',
    status: 'sent',
    priority: '3',
    draft_text: 'Dear Priya,\n\nThank you for submitting your rental application for 5 Banksia Street.\n\nWe have received your application and will be in touch within 2–3 business days.\n\nKind regards,\nSenior Sales Agent | SmartFlow Automation',
    locked: 'false',
    locked_by: '',
    lock_expires_at: '',
    error_message: '',
    error_count: '0',
    draft_generation_attempts: '1',
    draft_generated_at: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sent_message_id: 'sent-mock-003',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    gmail_message_id: 'mock-msg-004',
    gmail_thread_id: 'mock-thread-004',
    email_from: 'michael.obrien@gmail.com',
    email_from_name: 'Michael O\'Brien',
    email_subject: 'RE: 7 Coral Way — Finance Approval',
    email_body_snippet: 'Hi, I\'m pleased to inform you that our finance for 7 Coral Way has been unconditionally approved. We are ready to proceed to settlement.',
    email_body_full: 'Hi,\n\nGreat news — our finance for 7 Coral Way, Mandurah has been unconditionally approved by ANZ Bank.\n\nWe are ready to proceed to settlement and expect it to be completed within 21 days as per the contract.\n\nPlease confirm receipt and advise on next steps.\n\nKind regards,\nMichael O\'Brien\n0445 555 004',
    received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Michael O\'Brien',
    customer_email: 'michael.obrien@gmail.com',
    customer_phone: '0445 555 004',
    email_category: 'financial_docs',
    email_urgency: 'high',
    email_summary: 'Finance unconditionally approved for 7 Coral Way. Buyer ready to proceed to settlement in 21 days.',
    status: 'failed',
    priority: '1',
    draft_text: '',
    locked: 'false',
    locked_by: '',
    lock_expires_at: '',
    error_message: 'AI generation failed: upstream model error',
    error_count: '2',
    draft_generation_attempts: '2',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    gmail_message_id: 'mock-msg-005',
    gmail_thread_id: 'mock-thread-005',
    email_from: 'spam@bulkmailer.com',
    email_from_name: 'BulkMailer Pro',
    email_subject: 'Congratulations! You\'ve won a free iPhone',
    email_body_snippet: 'Click here to claim your prize...',
    email_body_full: 'Click here to claim your prize...',
    received_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    customer_name: '',
    customer_email: 'spam@bulkmailer.com',
    customer_phone: '',
    email_category: 'unrelated',
    email_urgency: 'low',
    email_summary: 'Spam email. No action required.',
    status: 'no_reply_needed',
    priority: '5',
    draft_text: '',
    locked: 'false',
    locked_by: '',
    lock_expires_at: '',
    error_message: '',
    error_count: '0',
    draft_generation_attempts: '0',
    no_reply_reason: 'Spam',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    gmail_message_id: 'mock-msg-006',
    gmail_thread_id: 'mock-thread-006',
    email_from: 'linda.park@gmail.com',
    email_from_name: 'Linda Park',
    email_subject: 'Property appraisal request — 22 Jarrah Road',
    email_body_snippet: 'Hi, I\'m thinking of selling my property at 22 Jarrah Road, Kalamunda. Could you please arrange a free appraisal? I\'m hoping to list in the next 2-3 months.',
    email_body_full: 'Hi,\n\nI\'m thinking of selling my property at 22 Jarrah Road, Kalamunda and I\'d like to get a free appraisal.\n\nThe property is a 4-bedroom, 2-bathroom home on 650sqm.\n\nI\'m hoping to list it in the next 2–3 months.\n\nMy phone is 0456 555 006.\n\nThanks,\nLinda Park',
    received_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Linda Park',
    customer_email: 'linda.park@gmail.com',
    customer_phone: '0456 555 006',
    email_category: 'inquiry',
    email_urgency: 'medium',
    email_summary: 'Seller requesting property appraisal for 22 Jarrah Road, Kalamunda. Wants to list in 2–3 months.',
    status: 'archived',
    priority: '2',
    draft_text: 'Dear Linda,\n\nThank you for reaching out about 22 Jarrah Road, Kalamunda.\n\nI\'d be delighted to arrange a complimentary appraisal for your property...',
    locked: 'false',
    locked_by: '',
    lock_expires_at: '',
    error_message: '',
    error_count: '0',
    draft_generation_attempts: '1',
    sent_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    archived_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    archive_reason: 'Replied and archived',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
  },
]

// In-memory copy for mock mutations
let rows = JSON.parse(JSON.stringify(SEED_ROWS))

export function mockRows({ status, limit = 50, offset = 0 } = {}) {
  let filtered = [...rows]
  if (status) filtered = filtered.filter(r => r.status === status)
  filtered.sort((a, b) => {
    if (Number(a.priority) !== Number(b.priority)) return Number(a.priority) - Number(b.priority)
    return new Date(b.received_at) - new Date(a.received_at)
  })
  const total = filtered.length
  const page = filtered.slice(Number(offset), Number(offset) + Number(limit))
  return { rows: page, total, limit: Number(limit), offset: Number(offset) }
}

export function mockRow(rowId) {
  const row = rows.find(r => String(r.id) === String(rowId))
  if (!row) throw new Error('Row not found')
  return row
}

export function mockAction(action, rowId) {
  const idx = rows.findIndex(r => String(r.id) === String(rowId))
  if (idx === -1) throw new Error('Row not found')
  const row = rows[idx]

  if (action === 'generateDraft') {
    rows[idx] = {
      ...row,
      status: 'draft_ready',
      draft_text: `Dear ${row.customer_name || 'Valued Customer'},\n\nThank you for your email regarding "${row.email_subject}".\n\n${row.email_summary}\n\nWe will be in touch shortly.\n\nKind regards,\nSenior Sales Agent | SmartFlow Automation`,
      draft_generated_at: new Date().toISOString(),
      draft_generation_attempts: String(Number(row.draft_generation_attempts || 0) + 1),
      updated_at: new Date().toISOString(),
    }
    return { success: true, draft: rows[idx].draft_text, status: 'draft_ready' }
  }

  if (action === 'approveSend') {
    rows[idx] = {
      ...row,
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_message_id: `mock-sent-${rowId}-${Date.now()}`,
      updated_at: new Date().toISOString(),
    }
    return { success: true, status: 'sent' }
  }

  if (action === 'markNoReply') {
    rows[idx] = { ...row, status: 'no_reply_needed', updated_at: new Date().toISOString() }
    return { success: true, status: 'no_reply_needed' }
  }

  if (action === 'archiveRow') {
    rows[idx] = {
      ...row,
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { success: true, status: 'archived' }
  }

  if (action === 'unlockRow') {
    rows[idx] = {
      ...row,
      status: 'pending_review',
      locked: 'false',
      locked_by: '',
      lock_expires_at: '',
      updated_at: new Date().toISOString(),
    }
    return { success: true, status: 'pending_review' }
  }

  return { success: false, error: 'Unknown action' }
}
