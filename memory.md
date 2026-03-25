# memory.md — OpenHome AI Demo v2 (feat-email-dashboard)

## Current Status

- **Completed:** Project initialised; n8n workflows WFE, WF2G, WF2H, WFC, WFB, WFD, WF1; Task 9 — React/Vite scaffolded; Task 10 — API layer + mock data; Task 11 — useEmailQueue hook; Task 12 — StatusBadge + layout shell; Task 13 — EmailList; Task 14 — EmailDetail + ActionButtons; Task 15 — Live API enabled, field mismatches fixed, E2E tests passed
- **In Progress:** None
- **Known Issues:** n8n IF v2.2 actual behaviour on this instance: branch[0] = TRUE path, branch[1] = FALSE path (opposite of task spec wording — connections must be set accordingly)

## Current Phase

Phase 5 — React/Vite Dashboard UI (Tasks 14-16 remaining)

## Immediate Goal

Task 16: Deploy to Vercel

## n8n Workflow Registry — [REALESTATE DEMO]

| ID | Workflow | Webhook path | Status |
|----|----------|-------------|--------|
| `RwrAYJx0XvSLPLA9` | WFE – Unlock & Reset | `re-unlock` | active |
| `Qh1KnGk5BKDMgr3I` | WF2G – Get Row | `re-row` | active |
| `(WF2H)` | WF2H – List Queue | `re-list` | active |
| `IqidW8hrIY2vaPFP` | WFC – Approve & Send | `re-send` | active |
| `ry88tCTs3oKjjhAL` | WFB – Mark No-Reply | `re-no-reply` | active |
| `KobSqJ9sbWOCEX3o` | WFD – Archive | `re-archive` | active |
| `DYmTKLtNP11h7kEH` | WF1 – Email Intake | Gmail Trigger (polling, everyMinute) | active |

- DataTable ID: `SNuUAGKhh9vTHWlR` ([REALESTATE DEMO] Reply Queue)
- Tag ID: `IDU4Lx7hsmT2ye97`

## Last Session Summary

- Task 15: Set `VITE_USE_LIVE_API=true` in `.env.local`
- Task 15: Fixed `send_failed` status not included in inbox TAB_FILTERS (App.jsx), EmailDetail draft area, error display, and ActionButtons conditions
- Task 15: Fixed `locked === '1'` handling — API returns locked as `"0"`/`"1"` strings, not booleans; updated isLocked and isGenerating checks in ActionButtons.jsx and EmailDetail.jsx
- Task 15: Verified Vite proxy `/webhook/*` → n8n works correctly
- Task 15: E2E tested all actions: list (2 rows), generate-draft (success), no-reply (success), archive (success), unlock (success); re-send skipped (would trigger real Gmail)

## Next Step

Task 16: Deploy to Vercel — configure environment variables (VITE_USE_LIVE_API=true, VITE_N8N_URL), set up CORS or proxy rewrite rules for `/webhook/*` routes, deploy production build

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n instance: `https://n8n.srv823907.hstgr.cloud`
- n8n workflow ID (original demo): `K35bKpcdpjG9Fgzk`
- Worktree: `/Users/ambrosevoon/Projects/realestate-demo2/.worktrees/feat-email-dashboard`
- .env.local: `WFC_ID`, `WFB_ID`, `WFD_ID`, `WF1_ID`, `VITE_N8N_URL`, `VITE_USE_LIVE_API` set
- Stack: React 19, Vite 8, Tailwind CSS v4, @tailwindcss/vite
