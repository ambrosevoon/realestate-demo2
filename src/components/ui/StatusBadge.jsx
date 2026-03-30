const STATUS_META = {
  pending_review:  { label: 'Pending',      bg: 'bg-amber-100',   text: 'text-amber-700',  border: 'border-amber-300' },
  draft_ready:     { label: 'Draft Ready',  bg: 'bg-blue-100',    text: 'text-blue-700',   border: 'border-blue-300' },
  sending:         { label: 'Sending…',     bg: 'bg-indigo-100',  text: 'text-indigo-700', border: 'border-indigo-300' },
  sent:            { label: 'Sent',         bg: 'bg-green-100',   text: 'text-green-700',  border: 'border-green-300' },
  sent_test:       { label: 'Test Sent',    bg: 'bg-teal-100',    text: 'text-teal-700',   border: 'border-teal-300' },
  failed:          { label: 'Failed',       bg: 'bg-red-100',     text: 'text-red-700',    border: 'border-red-300' },
  send_failed:     { label: 'Send Failed',  bg: 'bg-red-100',     text: 'text-red-700',    border: 'border-red-300' },
  no_reply_needed: { label: 'No Reply',     bg: 'bg-slate-100',   text: 'text-slate-600',  border: 'border-slate-300' },
  archived:        { label: 'Archived',     bg: 'bg-gray-100',    text: 'text-gray-600',   border: 'border-gray-300' },
}

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}>
      {meta.label}
    </span>
  )
}
