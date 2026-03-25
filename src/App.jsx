import { useState, useRef } from 'react'
import { useEmailQueue } from './hooks/useEmailQueue.js'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import EmailList from './components/email/EmailList.jsx'

const TAB_FILTERS = {
  inbox:   ['pending_review', 'draft_ready', 'failed'],
  sent:    ['sent', 'sent_test'],
  archive: ['archived', 'no_reply_needed'],
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedRowId, setSelectedRowId] = useState(null)
  const viewedIds = useRef(new Set())
  const { rows, loading, error, refresh } = useEmailQueue()

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
          ) : (
            <EmailList
              rows={filteredRows}
              activeTab={activeTab}
              selectedRowId={selectedRowId}
              onSelect={handleSelect}
              viewedIds={viewedIds.current}
            />
          )}
        </main>
      </div>
    </div>
  )
}
