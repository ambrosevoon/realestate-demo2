import { useState, useRef } from 'react'
import { useEmailQueue } from './hooks/useEmailQueue.js'
import { useTheme } from './hooks/useTheme.js'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import EmailList from './components/email/EmailList.jsx'
import EmailDetail from './components/detail/EmailDetail.jsx'

const TAB_FILTERS = {
  inbox:   ['pending_review', 'draft_ready', 'failed', 'send_failed'],
  sent:    ['sent', 'sent_test'],
  archive: ['archived', 'no_reply_needed'],
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedRowId, setSelectedRowId] = useState(null)
  const viewedIds = useRef(new Set())
  const queue = useEmailQueue()
  const { rows, loading, error, refresh } = queue
  const { theme, toggleTheme } = useTheme()

  const filteredRows = rows.filter(r => TAB_FILTERS[activeTab]?.includes(r.status))
  const selectedRow = rows.find(r => String(r.id) === String(selectedRowId)) || null

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSelectedRowId(null)
  }

  function handleSelect(rowId) {
    viewedIds.current.add(String(rowId))
    setSelectedRowId(rowId)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} rows={rows} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar activeTab={activeTab} onRefresh={() => refresh()} loading={loading} theme={theme} onToggleTheme={toggleTheme} />

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', flexShrink: 0 }}>
            Error: {error}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Left pane — email list */}
          <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            {loading && rows.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--muted)' }}>
                Loading emails…
              </div>
            ) : (
              <EmailList
                rows={filteredRows}
                activeTab={activeTab}
                selectedRowId={selectedRowId}
                onSelect={handleSelect}
                viewedIds={viewedIds.current}
              />
            )}
          </div>

          {/* Right pane — email detail */}
          <div className="flex-1 overflow-hidden">
            {selectedRow ? (
              <EmailDetail key={selectedRow.id} row={selectedRow} queue={queue} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--muted)' }}>
                Select an email to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
