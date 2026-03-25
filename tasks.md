# tasks.md — OpenHome AI Demo v2 (feat-email-dashboard)

## Phase 0 — Setup
- [x] Initialise repo and create CLAUDE.md, memory.md, tasks.md (2026-03-25)

## Phase 4 — Email Reply Dashboard (n8n Workflows)
- [x] Task 1: Create [REALESTATE DEMO] Reply Queue Data Table (2026-03-25)
- [x] Task 2: Build WFE — Unlock & Reset (2026-03-25)
- [x] Task 3: Build WF2G — Get Row (2026-03-25)
- [x] Task 4: Build WF2H — List Queue (2026-03-25)
- [ ] Task 5: Build WFA — Generate Draft
- [x] Task 6: Build WFC — Approve & Send (2026-03-25)
- [x] Task 7: Build WFB + WFD — Utility Workflows (2026-03-25)
- [x] Task 8: Build WF1 — Email Intake (2026-03-25)

## Phase 5 — React/Vite Dashboard UI
- [x] Task 9: Scaffold React/Vite project (2026-03-25)
- [x] Task 10: API layer + mock data (2026-03-25)
- [x] Task 11: useEmailQueue hook (2026-03-25)
- [x] Task 12: StatusBadge + layout shell (2026-03-25)
- [x] Task 13: EmailList component (2026-03-25)
- [x] Task 14: EmailDetail + ActionButtons (2026-03-25)
- [x] Task 15: Live API integration + E2E test (2026-03-25)
- [ ] Task 16: Deploy to Vercel + configure CORS

## Phase 1 — v2 Demo Site Build
- [ ] Define scope: what changes from v1
- [ ] Build index.html structure
- [ ] Write css/main.css
- [ ] Write js/config.js with updated property/agency data
- [ ] Write js/chat.js (ChatWidget)
- [ ] Write js/voice.js (VoiceWidget)
- [ ] Write js/app.js (page behaviour)
- [ ] Write prompts/ system prompt templates
- [ ] Test chat flow end-to-end with n8n webhook
- [ ] Test voice flow end-to-end with n8n webhook
- [ ] Cross-browser/responsive QA

## Phase 2 — Deploy
- [ ] Choose hosting (static host / VPS)
- [ ] Deploy and verify production webhook URL
- [ ] Update Google Sheets spreadsheetId in n8n workflow
