# memory.md — OpenHome AI Demo v2

## Current Status

- **Completed:** All 7 n8n workflows, React scaffold, API layer + mock data, useEmailQueue hook, StatusBadge + layout shell
- **In Progress:** EmailList component (Task 13)
- **Known Issues:** None

## Current Phase

Phase 2 — React Frontend (Task 13: EmailList component)

## Immediate Goal

Build Task 13: EmailList component — render filtered email list with row selection and status indicators

## Last Session Summary (2026-03-25)

- Task 11: Created useEmailQueue.js hook with mock data source (auto-refresh every 5s, pagination support)
- Task 12: Built StatusBadge.jsx with 9 status colors + labels (pending, draft_ready, sending, sent, test, failed, archived, etc.)
- Created Sidebar.jsx (3-tab navigation: Inbox/Sent/Archive with status-based filtering and counts)
- Created TopBar.jsx (header with active tab label and refresh button)
- Updated App.jsx with full layout shell — Sidebar + TopBar + email list view with row selection
- All 4 files built successfully, committed as `feat(react): add layout shell, Sidebar, TopBar, StatusBadge`
- Total lines added: 179

## Next Step

Build Task 13: EmailList component — extract email list rendering from App.jsx into standalone component

## n8n Workflow Registry

| ID | Name | Webhook | Status |
|----|------|---------|--------|
| RwrAYJx0XvSLPLA9 | [REALESTATE DEMO] WFE – Unlock & Reset | POST /re-unlock | Active |
| Qh1KnGk5BKDMgr3I | [REALESTATE DEMO] WF2G – Get Row | GET /re-row | Active |
| Zg7u1KbICAbc1NFb | [REALESTATE DEMO] WF2H – List Queue | GET /re-list | Active |
| gH9tI9I1U4ie2zHC | [REALESTATE DEMO] WFA – Generate Draft | POST /re-generate-draft | Active |
| IqidW8hrIY2vaPFP | [REALESTATE DEMO] WFC – Approve & Send | POST /re-send | Active |

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n webhook: `https://n8n.srv823907.hstgr.cloud/webhook/real-estate-chat`
- n8n workflow ID: `K35bKpcdpjG9Fgzk`
- DataTable: `[REALESTATE DEMO] Reply Queue`, ID: `SNuUAGKhh9vTHWlR`
- Tag: `REALESTATE DEMO`, ID: `IDU4Lx7hsmT2ye97`
