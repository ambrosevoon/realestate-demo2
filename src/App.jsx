import { useState } from 'react'
import { useEmailQueue } from './hooks/useEmailQueue.js'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'

const TAB_FILTERS = {
  inbox:   ['pending_review', 'draft_ready', 'failed'],
  sent:    ['sent', 'sent_test'],
  archive: ['archived', 'no_reply_needed'],
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedRowId, setSelectedRowId] = useState(null)
  const { rows, loading, error, refresh } = useEmailQueue()

  const filteredRows = rows.filter(r => TAB_FILTERS[activeTab]?.includes(r.status))
  const selectedRow = rows.find(r => String(r.id) === String(selectedRowId)) || null

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSelectedRowId(null)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} rows={rows} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeTab={activeTab} onRefresh={refresh} loading={loading} />

        <main className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              Error: {error}
            </div>
          )}

          {loading && rows.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>
              Loading emails…
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>
              No emails in this tab.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRows.map(row => (
                <div key={row.id}
                  onClick={() => setSelectedRowId(row.id)}
                  className="px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm"
                  style={{
                    background: selectedRowId === row.id ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedRowId === row.id ? 'rgba(34,211,238,0.2)' : 'var(--border)'}`,
                    color: 'var(--text)'
                  }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate mr-4">{row.email_subject || '(no subject)'}</span>
                    {/* StatusBadge placeholder — will be replaced in Task 12 */}
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>{row.status}</span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                    {row.email_from_name || row.email_from} · {row.email_category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
