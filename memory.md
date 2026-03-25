# memory.md — OpenHome AI Demo v2

## Current Status

- **Completed:** WFE, WF2G, WF2H, WFA all live and tested
- **In Progress:** Nothing
- **Known Issues:** None

## Current Phase

Phase 1 — n8n Workflow Backend (Real Estate Email Reply Dashboard)

## Immediate Goal

Build Task 6: WFC – Approve & Send (send approved draft via Gmail, update status to sent)

## Last Session Summary

- 2026-03-25: Built WFA (ID: gH9tI9I1U4ie2zHC) — POST /webhook/re-generate-draft
- Workflow: Webhook → Get Queue Rows → Validate Request → Route (IF v2.2) → [error path: Respond Validation Error] / [success path: Build Lock Payload → Lock Row → Build Prompt → Generate Draft (AI Agent + OpenRouter) → Build Update Payload → Write Result → Respond Result]
- Key fix 1: IF v2.2 output 0 = true, output 1 = false (not the reverse)
- Key fix 2: AI Agent prompt expression with single-quoted node names can't use escaped quotes — solved by adding a "Build Prompt" Code node to build promptText, then `{{ $json.promptText }}` in agent
- Key fix 3: Respond Result must reference `$('Build Update Payload').item.json` not `$json` (DataTable UPDATE strips extra fields like success/draft_text_out)
- Agent returns `output` field (not `message.content`) — Build Update Payload checks `$input.first().json.output`
- E2E tests passed: validation error (missing rowId → 400), draft generation (rowId 2 → draft_ready with full AI text), row verified in DataTable

## Next Step

Build Task 6: WFC – Approve & Send
- Webhook: POST /re-approve-send
- Input: `{ rowId }` — reads row, sends draft_text via Gmail, updates status to `sent`
- Must validate status is `draft_ready`, lock row, send via Gmail node, unlock and write sent_at + sent_message_id

## n8n Workflow Registry

| ID | Name | Webhook | Status |
|----|------|---------|--------|
| RwrAYJx0XvSLPLA9 | [REALESTATE DEMO] WFE – Unlock & Reset | POST /re-unlock | Active |
| Qh1KnGk5BKDMgr3I | [REALESTATE DEMO] WF2G – Get Row | GET /re-row | Active |
| Zg7u1KbICAbc1NFb | [REALESTATE DEMO] WF2H – List Queue | GET /re-list | Active |
| gH9tI9I1U4ie2zHC | [REALESTATE DEMO] WFA – Generate Draft | POST /re-generate-draft | Active |

## Reference

- v1 project: `/Users/ambrosevoon/Projects/realestate-demo`
- n8n webhook: `https://n8n.srv823907.hstgr.cloud/webhook/real-estate-chat`
- n8n workflow ID: `K35bKpcdpjG9Fgzk`
- DataTable: `[REALESTATE DEMO] Reply Queue`, ID: `SNuUAGKhh9vTHWlR`
- Tag: `REALESTATE DEMO`, ID: `IDU4Lx7hsmT2ye97`
