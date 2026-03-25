# memory.md — OpenHome AI Demo v2

## Current Status

- **Completed:** Project initialised, WFE – Unlock & Reset workflow live and tested
- **In Progress:** Nothing
- **Known Issues:** None

## Current Phase

Phase 1 — n8n Workflow Backend (Real Estate Email Reply Dashboard)

## Immediate Goal

Build remaining n8n workflows: WF2G (Get Row), WF2H (List Queue), WFA (Generate Draft), WFC (Approve & Send), WFB+WFD (utilities), WF1 (Email Intake)

## Last Session Summary

- 2026-03-25: Built [REALESTATE DEMO] WFE – Unlock & Reset (n8n workflow ID: RwrAYJx0XvSLPLA9)
- Webhook: POST https://n8n.srv823907.hstgr.cloud/webhook/re-unlock
- Tag REALESTATE DEMO created (ID: IDU4Lx7hsmT2ye97) and assigned
- Added alwaysOutputData: true on Get Queue Rows node to handle empty table case
- Full E2E test passed: 404 for unknown rowId, 200 + DB update for valid rowId
- WFE_ID saved to .env.local; committed to git

## Next Step

Build Task 3: WF2G – Get Row (webhook GET/POST that returns a single row by ID or gmail_message_id)

## n8n Workflow Registry

| ID | Name | Webhook | Status |
|----|------|---------|--------|
| RwrAYJx0XvSLPLA9 | [REALESTATE DEMO] WFE – Unlock & Reset | POST /re-unlock | Active |

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n webhook: `https://n8n.srv823907.hstgr.cloud/webhook/real-estate-chat`
- n8n workflow ID: `K35bKpcdpjG9Fgzk`
