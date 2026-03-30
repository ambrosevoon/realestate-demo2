// src/components/layout/Sidebar.jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const TAB_FILTERS = {
  inbox:   ['pending_review', 'draft_ready', 'failed'],
  sent:    ['sent', 'sent_test'],
  archive: ['archived', 'no_reply_needed'],
}

function countTab(rows, tab) {
  return rows.filter(r => TAB_FILTERS[tab].includes(r.status)).length
}

export default function Sidebar({ activeTab, onTabChange, rows }) {
  const sidebarRef = useRef(null)

  useEffect(() => {
    if (!sidebarRef.current) return
    gsap.fromTo(
      sidebarRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
    )
  }, [])

  const tabs = [
    { id: 'inbox',   label: 'Inbox',   icon: '📥' },
    { id: 'sent',    label: 'Sent',    icon: '✉️' },
    { id: 'archive', label: 'Archive', icon: '🗂️' },
  ]

  return (
    <aside
      ref={sidebarRef}
      className="w-56 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)', transition: 'background 0.3s', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SmartFlow
        </div>
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
              className={`sidebar-tab w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm relative overflow-hidden${isActive ? ' sidebar-tab-active' : ''}`}
              style={{
                background: isActive ? 'rgba(168,85,247,0.10)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: 3,
                  background: 'linear-gradient(180deg, var(--accent), var(--accent-2))',
                  animation: 'fadeIn 0.2s ease both',
                }} />
              )}
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
              {count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: isActive ? 'rgba(168,85,247,0.15)' : 'var(--tag-bg)', color: isActive ? 'var(--accent)' : 'var(--muted)' }}>
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
