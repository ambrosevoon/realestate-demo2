// src/components/layout/Sidebar.jsx

const TAB_FILTERS = {
  inbox:   ['pending_review', 'draft_ready', 'failed'],
  sent:    ['sent', 'sent_test'],
  archive: ['archived', 'no_reply_needed'],
}

function countTab(rows, tab) {
  return rows.filter(r => TAB_FILTERS[tab].includes(r.status)).length
}

export default function Sidebar({ activeTab, onTabChange, rows }) {
  const tabs = [
    { id: 'inbox',   label: 'Inbox',   icon: '📥' },
    { id: 'sent',    label: 'Sent',    icon: '✉️' },
    { id: 'archive', label: 'Archive', icon: '🗂️' },
  ]

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>SmartFlow</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Email Dashboard</div>
      </div>

      {/* Tabs */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {tabs.map(tab => {
          const count = countTab(rows, tab.id)
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: isActive ? 'rgba(34,211,238,0.08)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
              {count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: isActive ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.08)', color: isActive ? 'var(--accent)' : 'var(--muted)' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        SmartFlow Automation
      </div>
    </aside>
  )
}
