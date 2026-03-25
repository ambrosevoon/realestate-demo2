# Design Spec: Real Estate Email Reply Dashboard
**Date:** 2026-03-25
**Project:** realestate-demo2
**Status:** Approved (v2 — post spec review)

---

## Overview

A human-in-the-loop email reply system and dashboard for real estate agents, built under the **SmartFlow Automation** brand as a client demo product.

Emails arrive in the agent's Gmail → AI automatically drafts a reply → agent reviews in the dashboard → one-click approve and send.

This is a self-contained client simulation. All components are tagged `[REALESTATE DEMO]`. When onboarding a real client, the Gmail credential, agent details, and branding are swapped — no structural changes required.

---

## System Architecture

```
Gmail (Property Agent Demo) → [REALESTATE DEMO] WF1 Email Intake
                                    │
                                    ▼ (mirror node, continueOnFail: true)
                     [REALESTATE DEMO] Reply Queue (n8n Data Table)
                                    │
              ┌─────────────────────┼──────────────────────────┐
              ▼                     ▼                          ▼
    WFA Generate Draft       WFC Approve & Send     WFB/WFD/WFE Utilities
              └─────────────────────┴──────────────────────────┘
                                    │
                     WF2G (get row) / WF2H (list rows)
                                    │
                                    ▼
              React/Vite Dashboard → Vercel
```

---

## Section 1: n8n Backend

### Naming Convention
All 8 workflows and the Data Table are prefixed `[REALESTATE DEMO]`. Webhook paths use the `/webhook/re-*` prefix to avoid collision with `[ERQ]` paths (`/webhook/erq-*`).

### Workflow List

| ID | Name | Type | Webhook | Purpose |
|----|------|------|---------|---------|
| WF1 | `[REALESTATE DEMO] WF1 – Email Intake` | Gmail Trigger | — | Intake, categorise, mirror |
| WF2G | `[REALESTATE DEMO] WF2G – Get Row` | Webhook | `GET /webhook/re-row?rowId={id}` | Returns single full row object |
| WF2H | `[REALESTATE DEMO] WF2H – List Queue` | Webhook | `GET /webhook/re-list?status={s}&limit={n}&offset={n}` | Returns `{ rows: [...], total: n }` |
| WFA | `[REALESTATE DEMO] WFA – Generate Draft` | Webhook | `POST /webhook/re-generate-draft` | AI draft with lock |
| WFC | `[REALESTATE DEMO] WFC – Approve & Send` | Webhook | `POST /webhook/re-send` | Approve, send, label |
| WFB | `[REALESTATE DEMO] WFB – Mark No-Reply` | Webhook | `POST /webhook/re-no-reply` | Flag as no-reply |
| WFD | `[REALESTATE DEMO] WFD – Archive` | Webhook | `POST /webhook/re-archive` | Archive completed rows |
| WFE | `[REALESTATE DEMO] WFE – Unlock & Reset` | Webhook | `POST /webhook/re-unlock` | Admin: force unlock any row |

**Note:** There are 7 callable webhook endpoints (WF2G, WF2H, WFA, WFC, WFB, WFD, WFE). WF1 has no webhook — it is triggered by Gmail. To test WF1 in isolation, use n8n's "Fetch Test Event" on the Gmail Trigger node, or send a real email to the Property Agent Demo Gmail account.

---

### WF1 — Email Intake

Replicates `dRBo95BrvhdSzvAd` (read that workflow for reference — do not modify it). Credential and label IDs are shared with that workflow.

**Node sequence:**

```
[gmailTrigger] NEW EMAIL
      │
      ▼
[openAi] AI Categorizer
  → classifies into: inquiry | appointment | rental_application | financial_docs | unrelated
      │
      ├─► [if] IF: Inquiry
      │       → [gmail] Add Inquiry Label (Label_8111891637606795979)
      │       → [gmail] Mark Inquiry as Read
      │       → [agent] AI Agent (OpenRouter) — creates calendar event or Gmail draft
      │
      ├─► [if] IF: Appointment
      │       → [gmail] Add Appointment Label (Label_231793113985632563)
      │       → [gmail] Mark Appointment as Read
      │       → [agent] AI Agent — creates Google Calendar event
      │
      ├─► [if] IF: Rental Application
      │       → [gmail] Add Rental Application Label (Label_2459329082584057211)
      │       → [gmail] Mark Rental as Read
      │       → [gmail] Reply: Rental Application (Draft)
      │
      ├─► [if] IF: Financial Docs
      │       → [gmail] Add Financial Docs Label (Label_289823971799441203)
      │       → [gmail] Mark Financial Docs as Read
      │       → [gmail] Reply: Financial Docs (Draft)
      │
      └─► [if] IF: Unrelated
              → [gmail] Add Unrelated Label (Label_7530506331373121792)
              → [gmail] Mark Unwanted as Read

All paths converge:
      ▼
[code] Format Data
      ▼
[googleSheets] Store Log in Google Sheets (append)
      ▼
[DEDUP CHECK] Code node: check if gmail_message_id already in Reply Queue
      ▼ (only if not duplicate)
[dataTable] Mirror to [REALESTATE DEMO] Reply Queue  ← continueOnFail: true
```

**Deduplication guard (Code node before mirror):**
```javascript
const messageId = $('NEW EMAIL').item.json.id;
// In production: query the table to check existence
// For demo: use a simple Set stored in global context, or just allow duplicates to be idempotent
// Minimum: return row with flag so mirror node can conditionally execute
return [{ json: { messageId, shouldMirror: true } }];
```
> For the demo, the deduplication check is a passthrough but the Code node is present as the insertion point. For production use, query the Data Table and only mirror if `gmail_message_id` is not already present.

**Mirror node fields (Data Table insert):**
```javascript
source_row_id:      null  // no external source for this demo
gmail_message_id:   "={{ $('NEW EMAIL').item.json.id }}"
gmail_thread_id:    "={{ $('NEW EMAIL').item.json.threadId }}"
email_from:         "={{ $('NEW EMAIL').item.json.from.value[0].address }}"
email_from_name:    "={{ $('NEW EMAIL').item.json.from.value[0].name }}"
email_subject:      "={{ $('NEW EMAIL').item.json.subject }}"
email_body_snippet: "={{ $('NEW EMAIL').item.json.text?.slice(0,500) }}"
email_body_full:    "={{ $('NEW EMAIL').item.json.text }}"
received_at:        "={{ $('NEW EMAIL').item.json.date }}"
customer_name:      "={{ $('AI Categorizer').item.json.message.content.customer_name }}"
customer_email:     "={{ $('AI Categorizer').item.json.message.content.customer_email }}"
customer_phone:     "={{ $('AI Categorizer').item.json.message.content.customer_phone }}"
email_category:     "={{ $('AI Categorizer').item.json.message.content.category }}"
email_summary:      "={{ $('AI Categorizer').item.json.message.content.summary }}"
status:             "pending_review"
priority:           "={{ priority_from_category }}"  // see priority mapping below
locked:             "false"
created_at:         "={{ new Date().toISOString() }}"
updated_at:         "={{ new Date().toISOString() }}"
```

**Priority mapping (set by WF1 based on category):**
```
inquiry           → priority 2 (high — buyer lead)
appointment       → priority 2 (high — booking intent)
rental_application → priority 3 (medium)
financial_docs    → priority 1 (urgent — legal/financial)
unrelated         → priority 5 (low)
```
Priority is used in WF2H to sort the inbox list (ascending = most urgent first).

---

### WF2G — Get Single Row
```
GET /webhook/re-row?rowId={id}
Webhook → Get All Queue Rows (returnAll: true) → Code (find by id) → Respond
Response: full row object, or { error: 'Row not found', statusCode: 404 }
```

**Code node:**
```javascript
// Reference the webhook node by name to get query params — $input here contains rows from "Get All Queue Rows"
const rowId = $('Webhook').first().json.query.rowId;
const rows = $input.all().map(i => i.json);
const row = rows.find(r => String(r.id) === String(rowId));
if (!row) return [{ json: { error: 'Row not found', rowId }, statusCode: 404 }];
return [{ json: row }];
```

---

### WF2H — List Queue Rows
```
GET /webhook/re-list?status={s}&limit={n}&offset={n}
Webhook → Get All Queue Rows (returnAll: true) → Code (filter + sort + paginate) → Respond
Response: { rows: [...], total: n, limit: n, offset: n }
```

**Code node:**
```javascript
// Reference the webhook node by name to get query params — $input here contains rows from "Get All Queue Rows"
const { status, limit = 50, offset = 0 } = $('Webhook').first().json.query;
let rows = $input.all().map(i => i.json);
if (status) rows = rows.filter(r => r.status === status);
rows.sort((a, b) => {
  if (Number(a.priority) !== Number(b.priority)) return Number(a.priority) - Number(b.priority);
  return new Date(b.received_at) - new Date(a.received_at);
});
const total = rows.length;
const page = rows.slice(Number(offset), Number(offset) + Number(limit));
return [{ json: { rows: page, total, limit: Number(limit), offset: Number(offset) } }];
```

---

### WFA — Generate Draft

```
POST /webhook/re-generate-draft
Body: { rowId: "4", instructions?: "Keep it short and empathetic" }
```

**Node sequence:**
```
Webhook → Get All Queue Rows → Validate Request (Code) → Route Validation (IF 2.2)
  ├─ error → Respond Validation Error (integer responseCode)
  └─ ok → Lock Row (DataTable UPDATE — full record) → Generate Draft (OpenRouter, continueOnFail: true)
         → Build Update Payload (Code — handles both success & error)
         → Write Result (DataTable UPDATE — full record) ← DESTRUCTIVE: send all columns
         → Respond Result
```

**Eligible statuses:** `pending_review`, `draft_ready`, `failed`

**Validate Request (Code):**
```javascript
const body = $input.first().json.body;
const rowId = body?.rowId;
if (!rowId) return [{ json: { valid: false, error: 'rowId required', statusCode: 400 } }];
const rows = $input.all().slice(1).map(i => i.json);
const row = rows.find(r => String(r.id) === String(rowId));
if (!row) return [{ json: { valid: false, error: 'Row not found', statusCode: 404 } }];
if (row.locked === true || row.locked === 'true') {
  return [{ json: { valid: false, error: 'Row is locked', statusCode: 423 } }];
}
const eligible = ['pending_review', 'draft_ready', 'failed'];
if (!eligible.includes(row.status)) {
  return [{ json: { valid: false, error: `Status ${row.status} not eligible`, statusCode: 409 } }];
}
return [{ json: { valid: true, rowId, row, instructions: body.instructions || '' } }];
```

**Lock Row (DataTable UPDATE):**
> ⚠️ DataTable UPDATE is fully destructive. Send the complete row record plus lock fields — never a partial patch.
```javascript
// merge into the full existing row object:
{ ...existingRow, locked: true, locked_by: 'wfa', lock_expires_at: new Date(Date.now() + 5*60*1000).toISOString(), updated_at: new Date().toISOString() }
// Filter by gmail_message_id (not id)
```

**AI System Prompt (OpenRouter):**
```
You are an email assistant for SmartFlow Automation, a real estate technology company.
Write a professional reply on behalf of the Senior Sales Agent.

Email category: {email_category}
Customer name: {customer_name}
Subject: {email_subject}
Original message: {email_body_full}
Summary: {email_summary}

{instructions ? "Owner instructions (internal only, do not quote): " + instructions : ""}

Reply in plain text. No markdown. Professional Australian English.
Sign off: "Senior Sales Agent | SmartFlow Automation"
```

**Build Update Payload (Code) — handles success AND error, always releases lock:**
> ⚠️ Both paths must send the full row record. Lock must be released on both paths.
```javascript
const validateData = $('Validate Request').item.json;
const draftNode = $input.first();
const isError = draftNode.json.error || !draftNode.json.message?.content;
const prev = validateData.row;

if (isError) {
  return [{ json: { ...prev,
    status: 'failed',
    error_message: String(draftNode.json.error || 'AI generation failed'),
    error_count: (Number(prev.error_count) || 0) + 1,
    // draft_generation_attempts increments on every call (success or fail)
    draft_generation_attempts: (Number(prev.draft_generation_attempts) || 0) + 1,
    locked: false, locked_by: '', lock_expires_at: '',
    updated_at: new Date().toISOString()
  }}];
}

const draft = draftNode.json.message.content;
return [{ json: { ...prev,
  status: 'draft_ready',
  draft_text: draft,
  draft_generated_at: new Date().toISOString(),
  draft_generation_attempts: (Number(prev.draft_generation_attempts) || 0) + 1,
  error_count: prev.error_count || 0,  // preserve existing error count
  locked: false, locked_by: '', lock_expires_at: '',
  updated_at: new Date().toISOString()
}}];
```

> **Counter rules:** `draft_generation_attempts` increments on every WFA call (success or fail). `error_count` only increments on failure. `error_count` is NOT reset when a subsequent call succeeds — it is a cumulative failure counter.

---

### WFC — Approve & Send

```
POST /webhook/re-send
Body: { rowId: "4", finalDraft?: "Optional override text" }
```

**Node sequence:**
```
Webhook → Get All Queue Rows → Validate Request → Route (IF 2.2)
  ├─ error → Respond Error
  └─ ok → Validate draft not empty (Code) → Lock Row (status = sending, 3-min)
         → Build HTML Email (Code) → Send Reply (Gmail v2.1) → Add "Replied" Label (Gmail v2.1)
         → Mark as Read (Gmail v2.1) → Update Row Sent (DataTable UPDATE — full record)
         → Respond Sent
```

**Eligible status:** `draft_ready` only

**Validate draft not empty (Code):**
```javascript
const draft = $json.finalDraft || $json.row.draft_text;
if (!draft || draft.trim() === '') {
  return [{ json: { valid: false, error: 'Draft cannot be empty', statusCode: 400 } }];
}
return [{ json: { valid: true, draft } }];
```

**Lock Row:**
> ⚠️ DataTable UPDATE is fully destructive. Send complete row.
```javascript
{ ...existingRow, status: 'sending', locked: true, locked_by: 'wfc', lock_expires_at: new Date(Date.now() + 3*60*1000).toISOString(), updated_at: new Date().toISOString() }
```

**Gmail Send Reply — MUST be typeVersion 2.1:**
```json
{
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "parameters": {
    "operation": "reply",
    "messageId": "={{ $('Validate Request').item.json.row.gmail_message_id }}",
    "message": "={{ $json.htmlEmail }}",
    "options": { "sendAsHtml": true }
  }
}
```
> ⚠️ Use typeVersion 2.1. v2.2 requires `__rl` resource locator format which does NOT evaluate expressions → 400 from Google.

**Update Row Sent:**
> ⚠️ DataTable UPDATE is fully destructive. Send complete row.
```javascript
{ ...existingRow, status: 'sent', sent_at: new Date().toISOString(), sent_message_id: sentGmailId, locked: false, locked_by: '', lock_expires_at: '', updated_at: new Date().toISOString() }
```

**Stuck in `sending` recovery:** If WFC crashes after locking but before sending, the row is stuck in `sending` with `locked: true`. Call WFE (`POST /webhook/re-unlock`) with `{ rowId, resetStatus: "draft_ready" }` to recover. There is no automated stale-lock cleanup in v1 — recovery is manual via WFE.

---

### WFB — Mark No-Reply

```
POST /webhook/re-no-reply
Body: { rowId, notes? }
Eligible: pending_review, draft_ready, failed → status = no_reply_needed
```
> ⚠️ DataTable UPDATE is fully destructive. Send complete row with `{ ...existingRow, status: 'no_reply_needed', no_reply_reason: notes, updated_at: ... }`

---

### WFD — Archive

```
POST /webhook/re-archive
Body: { rowId, archive_reason? }
Eligible: sent, no_reply_needed → status = archived
```
> ⚠️ DataTable UPDATE is fully destructive. Send complete row.

---

### WFE — Unlock & Reset (Admin)

```
POST /webhook/re-unlock
Body: { rowId, resetStatus?: "pending_review", clearErrors?: false }
Any status → force unlock + reset
```

**`resetStatus` valid values:** `pending_review` | `draft_ready` | `failed`
**`resetStatus` default:** `pending_review`
**`clearErrors` default:** `false` — when `true`, also clears `error_message` and resets `error_count` to `0`

> ⚠️ DataTable UPDATE is fully destructive. Send complete row.

**Build this workflow on day one.** Locks will get stuck (Docker restart, network errors, WFC crash after locking). Without WFE, the queue gets permanently jammed.

---

## Section 2: Data Table

**Name:** `[REALESTATE DEMO] Reply Queue`

### Column Schema

```
Email identity:
  source_row_id     — null for this demo (in client deployments: ID from source system/CRM)
  gmail_message_id  — unique Gmail message ID; used as the DataTable UPDATE filter key
  gmail_thread_id   — Gmail thread ID for reply threading in WFC

Sender:
  email_from, email_from_name, email_subject,
  email_body_snippet (first 500 chars), email_body_full, received_at

AI extraction:
  customer_name, customer_email, customer_phone,
  email_category    — inquiry | appointment | rental_application | financial_docs | unrelated
  email_urgency     — reserved (not set in v1)
  email_summary, key_issues

Status lifecycle:
  status    — pending_review | draft_ready | sending | sent | failed | no_reply_needed | archived
  priority  — integer 1–5, set by WF1 based on email_category (see priority mapping in WF1)

AI draft:
  draft_text, draft_generated_at
  draft_generation_attempts  — increments on every WFA call (success or fail)

Locking:
  locked (boolean), locked_by (string: 'wfa' | 'wfc'), lock_expires_at (ISO string)

Error tracking:
  error_message     — last error from WFA
  error_count       — cumulative WFA failures (NOT reset on success)

Archiving:
  archived_at, archive_reason

Audit:
  created_at, updated_at, sent_at, sent_message_id,
  reviewed_by, notes, no_reply_reason
```

### Status Lifecycle

```
[incoming email]
      │
      ▼
pending_review ──► [WFA] ──► draft_ready ──► [WFC] ──► sent ──► [WFD] ──► archived
      │                          │                │
      │                          └──► [WFA fail] ──► failed
      │                                             │
      ▼                                             ▼
no_reply_needed ◄──── [WFB] ◄─────────────────────┘
      │
      ▼
archived ◄──── [WFD]

[any status] ──► [WFE] ──► pending_review | draft_ready | failed  (admin reset)

[sending] ──► stuck if WFC crashes ──► [WFE] to recover → draft_ready
```

---

## Section 3: React Dashboard

### Stack
- React 18 + Vite 5 + Tailwind CSS 3
- Deployed to Vercel
- `USE_LIVE_API` flag for mock/live toggle during development

### CORS Configuration

n8n is hosted on `n8n.srv823907.hstgr.cloud` behind Docker + Traefik. Add the following environment variable to the n8n Docker service in `docker-compose.yml` on the VPS:

```yaml
environment:
  - N8N_CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
```

Then restart the n8n container: `docker compose restart n8n`

For local development, Vite proxies all `/webhook/*` calls to n8n so the browser never hits CORS:

**`vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/webhook': {
        target: 'https://n8n.srv823907.hstgr.cloud',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
```

In production (Vercel), calls go directly to `https://n8n.srv823907.hstgr.cloud/webhook/*` — allowed by the `N8N_CORS_ALLOWED_ORIGINS` env var above.

### Project Location
`/Users/ambrosevoon/Projects/realestate-demo2/`

### File Structure
```
realestate-demo2/
├── src/
│   ├── App.jsx                   ← Root: layout, tab state, selected row, viewedIds Set
│   ├── main.jsx
│   ├── index.css                 ← Tailwind base + custom scrollbar
│   ├── api/n8n.js                ← 7 webhook API functions (wired from day one)
│   ├── data/mockData.js          ← Seed emails for USE_LIVE_API=false dev
│   ├── hooks/useEmailQueue.js    ← Poll loop, all actions, optimistic updates
│   └── components/
│       ├── layout/Sidebar.jsx    ← Tab filters, count badges, SmartFlow logo
│       ├── layout/TopBar.jsx     ← Title, Refresh button
│       ├── email/EmailList.jsx   ← Scrollable list, category pills, unviewed highlights
│       ├── detail/EmailDetail.jsx ← Original email, AI summary card, draft textarea
│       ├── detail/ActionButtons.jsx ← Status-aware buttons, auto-trigger WFA on mount
│       └── ui/StatusBadge.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env.example                  ← VITE_N8N_URL, VITE_USE_LIVE_API
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `App.jsx` | Root layout. Owns `activeTab`, `selectedRowId`, `viewedIds` Set. Passes handlers down. |
| `Sidebar.jsx` | Renders tab buttons (Inbox/Sent/Archive) with unread counts. |
| `EmailList.jsx` | Renders filtered email rows. Highlights unviewed `pending_review` rows. Calls `onSelect` on click. |
| `EmailDetail.jsx` | Displays full original email, AI summary, editable `draftText` state, and `ActionButtons`. |
| `ActionButtons.jsx` | Renders status-aware action buttons. On mount: if `status === 'pending_review'` and no `draft_text`, auto-calls `generateDraft`. Guards against duplicate calls with a `generatingRef`. |
| `useEmailQueue.js` | Owns `rows`, `loading`, `error` state. Exposes `generateDraft`, `sendReply`, `markNoReply`, `archive`, `unlock`. Runs `setInterval(refresh, 60_000)`, skips if any action in-flight. |
| `StatusBadge.jsx` | Renders coloured pill for any status string. |

### Auto-trigger WFA on Email Selection
`ActionButtons.jsx` owns this logic. On mount (when a new row is selected):
```javascript
useEffect(() => {
  if (row.status === 'pending_review' && !row.draft_text && !generatingRef.current) {
    generatingRef.current = row.id;
    generateDraft(row.id).finally(() => { generatingRef.current = null; });
  }
}, [row.id]);
```
The `generatingRef` (not state) prevents React re-renders from double-triggering.

### Loading / In-Flight States
- While WFA is running: draft textarea shows skeleton/spinner, `Generate Draft` and `Approve & Send` buttons are disabled
- While WFC is running: all action buttons disabled, status badge shows "Sending..."
- While any action in-flight: auto-poll is paused
- On locked row (API returns 423): show toast "This email is currently being processed" — no button state change needed (lock should clear within seconds)

### Branding
- **Business name:** SmartFlow Automation
- **Sign-off:** Senior Sales Agent
- **Theme:** Dark — deep navy/slate background (`#080d1a`), cyan accent (`#22d3ee`), consistent with existing SmartFlow tools

### Tab Filter Scopes

```javascript
const tabFilters = {
  inbox:   ['pending_review', 'draft_ready', 'failed'],
  sent:    ['sent'],
  archive: ['archived', 'no_reply_needed']
};
```

Filter chips reset to `null` on tab change. Chip options are scoped per tab (no cross-tab status options).

### Email Category Pills

```
inquiry             → blue
appointment         → violet
rental_application  → amber
financial_docs      → emerald
unrelated           → slate
```

### Status Badge Colors

```
pending_review  → amber   ("Pending")
draft_ready     → blue    ("Draft Ready")
sending         → indigo  ("Sending...")   — row is read-only, all buttons disabled
sent            → green   ("Sent")
failed          → red     ("Failed")
no_reply_needed → slate   ("No Reply")
archived        → gray    ("Archived")
```

### Action Buttons (status-aware)

| Status | Available Actions |
|--------|------------------|
| pending_review | Generate Draft, Mark No-Reply |
| draft_ready | Approve & Send, Regenerate Draft, Mark No-Reply |
| sending | — (all disabled, "Sending..." badge) |
| failed | Retry Draft, Mark No-Reply |
| sent | Archive |
| no_reply_needed | Archive |
| archived | — |

---

## Section 4: Deployment

### Vercel Setup
1. Push `realestate-demo2/` to GitHub
2. Create new Vercel project from that repo
3. Set environment variable in Vercel dashboard:
   - `VITE_N8N_URL` = `https://n8n.srv823907.hstgr.cloud`
4. After deploy, copy Vercel domain (e.g. `realestate-demo2.vercel.app`)
5. SSH into VPS, add `N8N_CORS_ALLOWED_ORIGINS=https://realestate-demo2.vercel.app` to n8n service in `docker-compose.yml`
6. `docker compose restart n8n`
7. Test each webhook endpoint from the deployed dashboard

### Redeploy (frontend changes only)
`git push` → Vercel auto-deploys. No VPS changes needed.

---

## Section 5: Client Onboarding Checklist

When replicating this system for a new client (e.g. `[DENTAL DEMO]`):

- [ ] Create new n8n Data Table: `[CLIENT NAME] Reply Queue`
- [ ] Create all 8 workflows fresh with `[CLIENT NAME]` prefix and `/webhook/<prefix>-*` paths
- [ ] Set Gmail credential → client's Gmail account
- [ ] Update AI prompt: client business name, agent name, sign-off
- [ ] Update WF1 Gmail label IDs → client's Gmail label IDs
- [ ] Update Data Table ID inside every workflow node that references it (not auto-carried from duplicates)
- [ ] Update dashboard `.env`: `VITE_N8N_URL` + any prefix changes in `api/n8n.js`
- [ ] Deploy new Vercel project:
  - Create new Vercel project from the same repo (or fork)
  - Set `VITE_N8N_URL` env var
  - Copy deployed domain
  - Add domain to `N8N_CORS_ALLOWED_ORIGINS` on VPS
  - `docker compose restart n8n`
- [ ] Send test email to client Gmail → verify it appears in dashboard as `pending_review`
- [ ] Generate draft → verify AI reply matches client's brand/sign-off
- [ ] Approve & Send → verify email arrives in Gmail thread

---

## Critical Implementation Rules

These apply to every n8n workflow in this system. Violations cause silent failures or hard bugs.

| Rule | Where it applies |
|------|-----------------|
| Filter DataTable UPDATE by `gmail_message_id` — not `id` | WFA, WFC, WFB, WFD, WFE |
| DataTable UPDATE is **fully destructive** — always send the complete row record | WFA, WFC, WFB, WFD, WFE |
| Gmail nodes with expression `messageId` MUST use `typeVersion: 2.1` | WFC |
| IF nodes MUST use `typeVersion: 2.2`, `singleValue: true`, `combinator: "and"` | All workflows with IF |
| No Merge node after IF — two complete independent terminal paths | All workflows with IF |
| `continueOnFail: true` on AI node — lock always released on both success and error | WFA |
| `continueOnFail: true` on mirror node — never block WF1 intake | WF1 |
| `responseCode` in respondToWebhook must be an integer, not a string | All webhook workflows |
| Every webhook node created via API needs a `webhookId` UUID field | All webhook workflows |
| Restart n8n Docker after creating workflows via API for webhooks to go live | Deployment |
| Both WFA success and error paths must release the lock | WFA |
| Build WFE on day one — stale locks are inevitable | WFE |
| Empty draft must be rejected before sending | WFC frontend + backend |
