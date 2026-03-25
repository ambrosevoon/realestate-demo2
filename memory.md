# memory.md — OpenHome AI Demo v2 (feat-email-dashboard)

## Current Status

- **Completed:** Project initialised (CLAUDE.md, memory.md, tasks.md, docs/); Email Reply Dashboard n8n workflows — WFE, WF2G, WF2H (List Queue), WFC (Approve & Send), WFB (Mark No-Reply), WFD (Archive)
- **In Progress:** Nothing
- **Known Issues:** n8n IF v2.2 actual behaviour on this instance: branch[0] = TRUE path, branch[1] = FALSE path (opposite of task spec wording — connections must be set accordingly)

## Current Phase

Phase 4 — Email Reply Dashboard (n8n workflow build)

## Immediate Goal

Task 8: Build WF1 — Email Intake workflow

## n8n Workflow Registry — [REALESTATE DEMO]

| ID | Workflow | Webhook path | Status |
|----|----------|-------------|--------|
| `RwrAYJx0XvSLPLA9` | WFE – Unlock & Reset | `re-unlock` | active |
| `Qh1KnGk5BKDMgr3I` | WF2G – Get Row | `re-row` | active |
| `(WF2H)` | WF2H – List Queue | `re-list` | active |
| `IqidW8hrIY2vaPFP` | WFC – Approve & Send | `re-send` | active |
| `ry88tCTs3oKjjhAL` | WFB – Mark No-Reply | `re-no-reply` | active |
| `KobSqJ9sbWOCEX3o` | WFD – Archive | `re-archive` | active |

- DataTable ID: `SNuUAGKhh9vTHWlR` ([REALESTATE DEMO] Reply Queue)
- Tag ID: `IDU4Lx7hsmT2ye97`

## Last Session Summary

- 2026-03-25: Created WFB (Mark No-Reply, id `ry88tCTs3oKjjhAL`) and WFD (Archive, id `KobSqJ9sbWOCEX3o`)
- Fixed IF Route connection ordering (n8n v2.2 on this instance routes branch[0]=TRUE, branch[1]=FALSE)
- Fixed Update Row node to use `defineBelow` mapping (not `autoMapInputData`) to avoid "unknown column 'valid'" error
- All tests passed: validation errors, wrong-status 409, valid WFB flow, valid WFD flow, DataTable verified
- Docker restarted to register webhooks

## Next Step

Task 8: Build WF1 — Email Intake workflow (receives Gmail webhook, validates, inserts row into DataTable, triggers WFA)

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n instance: `https://n8n.srv823907.hstgr.cloud`
- n8n workflow ID (original demo): `K35bKpcdpjG9Fgzk`
- Worktree: `/Users/ambrosevoon/Projects/realestate-demo2/.worktrees/feat-email-dashboard`
- .env.local: `WFC_ID`, `WFB_ID`, `WFD_ID` set
