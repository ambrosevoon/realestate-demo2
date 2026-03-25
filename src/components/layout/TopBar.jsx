// src/components/layout/TopBar.jsx

const TAB_LABELS = { inbox: 'Inbox', sent: 'Sent', archive: 'Archive' }

export default function TopBar({ activeTab, onRefresh, loading }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
      style={{ borderColor: 'var(--border)' }}>
      <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
        {TAB_LABELS[activeTab] || activeTab}
      </h1>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-opacity"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', opacity: loading ? 0.5 : 1 }}
      >
        <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>↻</span>
        Refresh
      </button>
    </header>
  )
}
