// src/components/ui/StatusBadge.jsx
const STATUS_META = {
  pending_review:  { label: 'Pending',      bg: 'bg-amber-500/20',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  draft_ready:     { label: 'Draft Ready',  bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  sending:         { label: 'Sending…',     bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  sent:            { label: 'Sent',         bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30' },
  sent_test:       { label: 'Test Sent',    bg: 'bg-teal-500/20',   text: 'text-teal-400',   border: 'border-teal-500/30' },
  failed:          { label: 'Failed',       bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30' },
  send_failed:     { label: 'Send Failed',  bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30' },
  no_reply_needed: { label: 'No Reply',     bg: 'bg-slate-500/20',  text: 'text-slate-400',  border: 'border-slate-500/30' },
  archived:        { label: 'Archived',     bg: 'bg-gray-500/20',   text: 'text-gray-400',   border: 'border-gray-500/30' },
}

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.text} ${meta.border}`}>
      {meta.label}
    </span>
  )
}
