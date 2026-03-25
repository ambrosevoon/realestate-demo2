# memory.md — OpenHome AI Demo v2 (feat-email-dashboard)

## Current Status

- **Completed:** Project initialised (CLAUDE.md, memory.md, tasks.md, docs/); Email Reply Dashboard n8n workflows — WFE, WF2G, WF2H (List Queue), WFC (Approve & Send), WFB (Mark No-Reply), WFD (Archive), WF1 (Email Intake)
- **In Progress:** Nothing
- **Known Issues:** n8n IF v2.2 actual behaviour on this instance: branch[0] = TRUE path, branch[1] = FALSE path (opposite of task spec wording — connections must be set accordingly)

## Current Phase

Phase 4 — Email Reply Dashboard (n8n workflow build)

## Immediate Goal

Task 9: Scaffold React/Vite project

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

- 2026-03-25: Created WF1 Email Intake (id `DYmTKLtNP11h7kEH`) — Gmail trigger (everyMinute, INBOX+UNREAD), AI Categorizer (`@n8n/n8n-nodes-langchain.openAi` / OpenRouter AI cred `rBhtyxKU39k0lhru`), Format Data (Code), Mirror to Reply Queue (DataTable INSERT, continueOnFail)
- Workflow activated successfully; polling every minute for new unread inbox emails
- Tag `IDU4Lx7hsmT2ye97` applied; WF1_ID added to .env.local
- Queue currently has 2 rows from prior testing

## Next Step

Task 9: Scaffold React/Vite project (Phase 5 — Email Reply Dashboard UI)

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n instance: `https://n8n.srv823907.hstgr.cloud`
- n8n workflow ID (original demo): `K35bKpcdpjG9Fgzk`
- Worktree: `/Users/ambrosevoon/Projects/realestate-demo2/.worktrees/feat-email-dashboard`
- .env.local: `WFC_ID`, `WFB_ID`, `WFD_ID` set
