# memory.md — OpenHome AI Demo v2

## Current Status

- **Completed:** ALL TASKS COMPLETE — full system live and E2E verified. Session 2 redesign in progress.
- **In Progress:** Theme redesign — warm gradient palette + framer-motion animations
- **Known Issues:** WF1 may miss emails that land in Gmail category tabs (Promotions/Social) rather than strict INBOX. The `labelIds: ["INBOX", "UNREAD"]` filter only catches primary inbox.

## Session 2 Bugs Found & Fixed (2026-03-30)

### Bug 1: Dashboard showing mock data on Vercel (not live n8n queue)
- **Root cause:** `VITE_USE_LIVE_API` env var was stored as `"true\n"` (with trailing newline) — likely entered by pasting + pressing Enter
- **Effect:** `import.meta.env.VITE_USE_LIVE_API === 'true'` always evaluated `false`, so every API call used mock data
- **Fix:** Removed the var with `vercel env rm`, re-added with `echo -n "true" | vercel env add ...` (no newline), redeployed
- **File:** Vercel project env vars (no code change needed)

### Bug 2: WF1 Email Intake only saving 1 email per batch instead of all
- **Root cause:** `Format Data` Code node in n8n used `$('NEW EMAIL').first()` — always grabbing the **first** email in the batch regardless of which item was being processed
- **Effect:** When 2+ emails arrived simultaneously, both iterations produced identical `gmail_message_id`, Mirror deduped them → only 1 saved
- **Fix:** Changed `.first()` → `.item` throughout Format Data node (paired item reference in n8n)
- **Workflow:** `[REALESTATE DEMO] WF1 – Email Intake` (DYmTKLtNP11h7kEH), patched via REST API

## Current Phase

COMPLETE — All 16 tasks done across Phases 1–3, E2E verified 2026-03-25

## Immediate Goal

None — system is deployed and verified end-to-end.

## Last Session Summary (2026-03-25)

- Completed full E2E verification: WFA (Generate Draft) + WFC (Approve & Send) on row 3 (real email from iidigitals@gmail.com)
- WFC returned `{ success: true, status: "sent" }`, row confirmed `status: sent`, `sent_at: 2026-03-25T13:43:49.976Z`
- Real Gmail reply sent to iidigitals@gmail.com thread for "Viewing for 12 Stirling St — Fri 3pm"
- Test email from ambrosevoon@gmail.com to property.agent.demo@gmail.com was NOT picked up by WF1 (likely landed in Gmail category tab, not INBOX)
- Dashboard deployed to https://realestate-demo2.vercel.app with vercel.json proxy (no CORS issues)

## Next Step

None. System fully operational. Optional future improvements:
- Investigate WF1 Gmail label filter to also catch Promotions/Social tabs if needed
- Add email template system (Phase 9 of n8n-email-reply-system skill)

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
- Dashboard: https://realestate-demo2.vercel.app
- GitHub: https://github.com/ambrosevoon/realestate-demo2
