// src/components/ui/hero-195.jsx
import { useState, useRef, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BorderBeam } from '@/components/ui/border-beam'
import { useEmailQueue } from '@/hooks/useEmailQueue.js'
import { useTheme } from '@/hooks/useTheme.js'
import EmailList from '@/components/email/EmailList.jsx'
import EmailDetail from '@/components/detail/EmailDetail.jsx'

// ── Icons ──────────────────────────────────────────────

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
)

const RefreshIcon = ({ spinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', animation: spinning ? 'spin 0.9s linear infinite' : 'none' }}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
  </svg>
)

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
)

// ── Constants ──────────────────────────────────────────

const TAB_FILTERS = {
  inbox:   ['pending_review', 'draft_ready', 'failed', 'send_failed'],
  sent:    ['sent', 'sent_test'],
  archive: ['archived', 'no_reply_needed'],
}

function countTab(rows, tab) {
  return rows.filter(r => TAB_FILTERS[tab]?.includes(r.status)).length
}

// ── useIsMobile ────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ── Main component ─────────────────────────────────────

export function Hero195() {
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedRowId, setSelectedRowId] = useState(null)
  const viewedIds = useRef(new Set())
  const queue = useEmailQueue()
  const { rows, loading, error, refresh } = queue
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const isMobile = useIsMobile()

  const filteredRows = rows.filter(r => TAB_FILTERS[activeTab]?.includes(r.status))
  const selectedRow = rows.find(r => String(r.id) === String(selectedRowId)) || null

  // On mobile, show detail pane when a row is selected
  const showDetail = isMobile ? !!selectedRow : true
  const showList   = isMobile ? !selectedRow : true

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSelectedRowId(null)
  }

  function handleSelect(rowId) {
    viewedIds.current.add(String(rowId))
    setSelectedRowId(rowId)
  }

  function handleBack() {
    setSelectedRowId(null)
  }

  const inboxCount   = countTab(rows, 'inbox')
  const sentCount    = countTab(rows, 'sent')
  const archiveCount = countTab(rows, 'archive')

  // ── Header ──

  const header = (
    <header
      className="flex items-center justify-between flex-shrink-0 border-b"
      style={{
        height: isMobile ? 60 : 64,
        padding: isMobile ? '0 16px' : '0 24px',
        borderColor: 'var(--border)',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Back button (mobile detail view) OR Logo */}
      {isMobile && selectedRow ? (
        <button
          onClick={handleBack}
          className="btn-interactive inline-flex items-center gap-2 font-medium"
          style={{ color: 'var(--dash-accent)', fontSize: 14, background: 'none', border: 'none', padding: '6px 0' }}
        >
          <BackIcon /> Back
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div style={{
            width: isMobile ? 36 : 42,
            height: isMobile ? 36 : 42,
            borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(145deg, #9333ea 0%, #c026d3 50%, #ec4899 100%)',
            boxShadow: '0 4px 16px rgba(147,51,234,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z"
                fill="white" fillOpacity="0.95" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            </svg>
          </div>
          {/* Brand text */}
          <div className="flex flex-col justify-center" style={{ gap: 1 }}>
            <span style={{
              fontSize: isMobile ? 17 : 19,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SmartFlow
            </span>
            {!isMobile && (
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.01em' }}>
                Intelligent outreach, automated.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {error && !isMobile && (
          <span className="text-xs px-2 py-1 rounded-md"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </span>
        )}
        <button
          onClick={refresh}
          disabled={loading}
          className="btn-interactive inline-flex items-center gap-1.5 rounded-md text-xs font-medium"
          style={{
            padding: isMobile ? '6px 10px' : '6px 12px',
            background: 'var(--topbar-btn-bg)',
            color: 'var(--muted-foreground)',
            border: '1px solid var(--border)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshIcon spinning={loading} />
          {!isMobile && 'Refresh'}
        </button>
        <button
          onClick={toggleTheme}
          className="btn-interactive inline-flex items-center gap-1.5 rounded-md text-xs font-medium"
          style={{
            padding: isMobile ? '6px 10px' : '6px 12px',
            background: 'var(--topbar-btn-bg)',
            color: 'var(--muted-foreground)',
            border: '1px solid var(--border)',
          }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          {!isMobile && (isDark ? 'Light' : 'Dark')}
        </button>
      </div>
    </header>
  )

  // ── Tabs bar (only shown when list is visible) ──

  const tabsBar = showList && (
    <div
      className="flex-shrink-0 border-b"
      style={{
        padding: isMobile ? '8px 12px' : '10px 24px',
        borderColor: 'var(--border)',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className="h-9 w-full"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: '1px solid var(--border)',
          }}
        >
          <TabsTrigger value="inbox" className="flex-1 gap-1.5 text-xs">
            Inbox
            {inboxCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(147,51,234,0.15)', color: 'var(--dash-accent)' }}>
                {inboxCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1 gap-1.5 text-xs">
            Sent
            {sentCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>
                {sentCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex-1 text-xs">
            Archive
            {archiveCount > 0 && (
              <span className="ml-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                {archiveCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )

  // ── List pane ──

  const listPane = showList && (
    <div
      className="overflow-y-auto"
      style={{ width: 320, flexShrink: 0, borderRight: '1px solid var(--border)' }}
    >
      {loading && rows.length === 0 ? (
        <div className="flex flex-col gap-3 p-4">
          {[1,2,3].map(i => (
            <div key={i} className="shimmer-box h-20 rounded-lg" />
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm"
          style={{ color: 'var(--muted-foreground)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ opacity: 0.4 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          No emails here
        </div>
      ) : (
        <div className="p-3">
          <EmailList
            rows={filteredRows}
            activeTab={activeTab}
            selectedRowId={selectedRowId}
            onSelect={handleSelect}
            viewedIds={viewedIds.current}
          />
        </div>
      )}
    </div>
  )

  // ── Detail pane ──

  const detailPane = showDetail && (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {selectedRow ? (
        <EmailDetail key={selectedRow.id} row={selectedRow} queue={queue} />
      ) : (
        !isMobile && <EmptyDetailState />
      )}
    </div>
  )

  // ── Layout ──

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
        {header}
        {selectedRow ? (
          /* Detail view — fills remaining height, scrolls internally */
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              {selectedRow && <EmailDetail key={selectedRow.id} row={selectedRow} queue={queue} />}
            </div>
          </div>
        ) : (
          /* List view — tabs fixed, list scrolls */
          <>
            {tabsBar}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-3">
                {loading && rows.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => <div key={i} className="shimmer-box h-20 rounded-lg" />)}
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: 0.4 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    No emails here
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
            </div>
          </>
        )}
      </div>
    )
  }

  // Desktop: side-by-side
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {header}
      {tabsBar}
      <div className="flex-1 flex min-h-0">
        {listPane}
        {detailPane}
      </div>
    </div>
  )
}

// ── Empty state (desktop only) ─────────────────────────

function EmptyDetailState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-4 mb-2">
        {[
          { label: 'AI-Powered',    desc: 'Instant reply drafts' },
          { label: 'Smart Queue',   desc: 'Priority sorted inbox' },
          { label: 'One-Click Send', desc: 'Review & approve fast' },
        ].map((item) => (
          <div key={item.label} className="relative overflow-hidden rounded-xl p-4 text-center"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              minWidth: 130,
            }}>
            <BorderBeam size={80} duration={6} colorFrom="var(--dash-accent)" colorTo="var(--dash-accent-2)" />
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--dash-accent)' }}>{item.label}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Select an email to get started
      </p>
    </div>
  )
}
