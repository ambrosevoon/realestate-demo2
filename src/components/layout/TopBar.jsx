// src/components/layout/TopBar.jsx

const TAB_LABELS = { inbox: 'Inbox', sent: 'Sent', archive: 'Archive' }

export default function TopBar({ activeTab, onRefresh, loading, theme, onToggleTheme }) {
  const isDark = theme === 'dark'
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
      style={{ borderColor: 'var(--border)' }}>
      <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
        {TAB_LABELS[activeTab] || activeTab}
      </h1>
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="btn-interactive flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
          style={{ background: 'var(--topbar-btn-bg)', color: 'var(--muted)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn-interactive flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
          style={{ background: 'var(--topbar-btn-bg)', color: 'var(--muted)', opacity: loading ? 0.5 : 1 }}
        >
          <span className={loading ? 'animate-spin-icon' : ''} style={{ display: 'inline-block' }}>↻</span>
          Refresh
        </button>
      </div>
    </header>
  )
}
