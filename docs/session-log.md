# Session Log — OpenHome AI Demo v2

---

## 2026-03-31 (Session 3)

### What was done
- Rebuilt n8n workflow `dRBo95BrvhdSzvAd` (Real Estate Lead Automation - DEMO v1.0) with batch polling architecture to fix the 1-email-per-minute limitation
- Replaced `gmailTrigger` with `Schedule Trigger` (every 2 min) + `Get Unread Emails` (Gmail Get Messages, limit=5) + `Prepare Emails` Code node
- Fixed AI Categorizer user message field names: `$json.from` / `$json.subject` → `$json.From` / `$json.Subject` / `$json.snippet` (Gmail Get Messages format)
- Diagnosed and fixed "task runner disconnect" crash in `Format Data` Code node
- Replaced `Format Data` Code node with a Set node to avoid task runner dependency

### Problems encountered
1. **Format Data Code node crashing** — `InternalTaskRunnerDisconnectAnalyzer` error even with 1 item and minimal code. Root cause: n8n task runner crashes on any cross-node reference (`$('NodeName').item.json`) in Code nodes on this VPS.
2. **Timeout with 50-item batch** — AI Categorizer makes 1 OpenAI call per item; 50 × ~6s = 300s+ hits n8n execution timeout. Fixed by capping `Get Unread Emails` limit to 5.

### Fixes applied
- Replaced Code node `Format Data` with Set node — expressions evaluated in main n8n process, no task runner, cross-node references work fine
- Limit set to 5 emails per cycle (processes 150 emails/hour, well within 300s timeout)
- Added `Prepare Emails` Code node before AI Categorizer to strip Gmail items to minimal fields (id, threadId, From, Subject, snippet ≤800 chars)

### Files changed
- `tasks.md` — added Task 24 (completed)
- `memory.md` — updated Current Status, added Session 3 bugs section
- `docs/session-log.md` — created this file
- n8n workflow `dRBo95BrvhdSzvAd` — rebuilt via REST API (no file changes)

### Verified
- Execution 48529: 5 emails fetched, 5 categorised (2 rental_application → draft created + label + mark-read; 3 unrelated → label + mark-read), 5 rows logged to Google Sheets. Status: success in 19s.

---

## 2026-03-30 (Session 2)

### What was done
- Fixed VITE_USE_LIVE_API env var trailing newline bug (dashboard was showing mock data on Vercel)
- Fixed WF1 Format Data `.first()` → `.item` bug (only 1 email saved per batch)
- Rebuilt WF1 (DYmTKLtNP11h7kEH) with batch polling: Schedule Trigger (2 min) + Gmail Get Messages + Filter New Only + batch Format Data
- Documented all 8 n8n workflows in `docs/n8n-workflows.md`
- Rebuilt `vZhSSdgANpWudsJG` (Send Demo Emails) — removed AI Agent + Wait nodes, replaced with pre-written templates + direct Gmail node

### Files changed
- `docs/n8n-workflows.md` — created
- `memory.md` — updated
- `tasks.md` — added Tasks 8b and 23
