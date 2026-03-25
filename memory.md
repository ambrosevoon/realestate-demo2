# memory.md — OpenHome AI Demo v2

## Current Status

- **Completed:** ALL TASKS COMPLETE — full system live
- **In Progress:** Nothing
- **Known Issues:** WFC real Gmail send test pending first real email via WF1 (synthetic message IDs can't be used for Gmail reply)

## Current Phase

COMPLETE — All 16 tasks done across Phases 1–3

## Immediate Goal

None — system is deployed. Next: send a real test email to Property Agent Demo Gmail to trigger WF1 → verify end-to-end flow.

## Last Session Summary (2026-03-25)

- Tasks 6–8: Built WFC (Approve & Send), WFB (Mark No-Reply), WFD (Archive), WF1 (Email Intake with mirror node)
- Tasks 9–15: Full React dashboard — Vite/React scaffold, API layer, useEmailQueue hook, StatusBadge, Sidebar, TopBar, EmailList, EmailDetail, ActionButtons, live API integration
- Fixed 3 live API issues: send_failed status, locked as "0"/"1" string integers, field name consistency
- Task 16: Deployed to https://realestate-demo2.vercel.app with vercel.json proxy for /webhook/* (no CORS config needed)
- GitHub: https://github.com/ambrosevoon/realestate-demo2

## Next Step

End-to-end test: send a real buyer enquiry email to the Property Agent Demo Gmail → WF1 triggers → row appears in dashboard → generate draft → approve & send → verify reply in Gmail thread.

## n8n Workflow Registry

| ID | Name | Webhook | Status |
|----|------|---------|--------|
| RwrAYJx0XvSLPLA9 | [REALESTATE DEMO] WFE – Unlock & Reset | POST /re-unlock | Active |
| Qh1KnGk5BKDMgr3I | [REALESTATE DEMO] WF2G – Get Row | GET /re-row | Active |
| Zg7u1KbICAbc1NFb | [REALESTATE DEMO] WF2H – List Queue | GET /re-list | Active |
| gH9tI9I1U4ie2zHC | [REALESTATE DEMO] WFA – Generate Draft | POST /re-generate-draft | Active |
| IqidW8hrIY2vaPFP | [REALESTATE DEMO] WFC – Approve & Send | POST /re-send | Active |
| ry88tCTs3oKjjhAL | [REALESTATE DEMO] WFB – Mark No-Reply | POST /re-no-reply | Active |
| KobSqJ9sbWOCEX3o | [REALESTATE DEMO] WFD – Archive | POST /re-archive | Active |
| DYmTKLtNP11h7kEH | [REALESTATE DEMO] WF1 – Email Intake | Gmail Trigger (polling) | Active |

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n webhook: `https://n8n.srv823907.hstgr.cloud/webhook/real-estate-chat`
- n8n workflow ID: `K35bKpcdpjG9Fgzk`
- DataTable: `[REALESTATE DEMO] Reply Queue`, ID: `SNuUAGKhh9vTHWlR`
- Tag: `REALESTATE DEMO`, ID: `IDU4Lx7hsmT2ye97`
