# n8n Workflows — SmartFlow Email Reply Dashboard

**Project:** realestate-demo2 (SmartFlow)
**n8n instance:** `https://n8n.srv823907.hstgr.cloud`
**DataTable:** `[REALESTATE DEMO] Reply Queue` (ID: `SNuUAGKhh9vTHWlR`)
**Last updated:** 2026-03-31

---

## Overview

The system uses **8 n8n workflows** split into two groups:

| Group | Purpose |
|-------|---------|
| **Background** | Automatically ingest and categorise incoming Gmail emails |
| **API (webhook-driven)** | Serve the React dashboard — list, read, generate draft, send, archive |

All data lives in a single n8n DataTable ("Reply Queue"). The React app never touches Gmail or any AI provider directly — everything goes through n8n webhooks.

---

## Architecture Diagram

```
Gmail Inbox
    │
    ▼ (every 2 min, batch)
┌─────────────────────────────────────────────────────┐
│  WF1 – Email Intake  (background, scheduled)        │
│  Fetch all unread → deduplicate → AI categorise     │
│  → write to DataTable                               │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  n8n DataTable        │
              │  [REALESTATE DEMO]    │
              │  Reply Queue          │
              └───────────────────────┘
                          │
         ┌────────────────┼──────────────────┐
         ▼                ▼                  ▼
   GET /re-list     GET /re-row       POST actions
   WF2H List Queue  WF2G Get Row      WFA / WFB / WFC / WFD / WFE
         │                │                  │
         └────────────────┴──────────────────┘
                          │
                          ▼
               React Dashboard (realestate-demo2)
```

---

## Data Schema — Reply Queue (DataTable)

Each row represents one inbound email. Fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | auto | DataTable row ID |
| `gmail_message_id` | string | Gmail message ID — used for deduplication and replying |
| `gmail_thread_id` | string | Gmail thread ID — used to send reply in the same thread |
| `email_from` | string | Sender email address |
| `email_from_name` | string | Sender display name |
| `email_subject` | string | Email subject line |
| `email_body_snippet` | string | First 500 chars of body |
| `email_body_full` | string | Full email body text |
| `received_at` | ISO datetime | When the email was received |
| `customer_name` | string | Extracted by AI from email content |
| `customer_email` | string | Extracted by AI (if different from sender) |
| `customer_phone` | string | Extracted by AI |
| `email_category` | enum | `inquiry` / `appointment` / `rental_application` / `financial_docs` / `unrelated` |
| `email_summary` | string | 1–2 sentence AI summary |
| `status` | enum | See status lifecycle below |
| `priority` | string (int) | `1`=financial_docs, `2`=inquiry/appointment, `3`=rental_application, `5`=unrelated |
| `draft_text` | string | AI-generated reply draft |
| `draft_generated_at` | ISO datetime | When draft was last generated |
| `draft_generation_attempts` | string (int) | How many times draft generation was tried |
| `locked` | bool/string | `true` when a background operation is running on this row |
| `locked_by` | string | Which workflow locked it (`wfa` = generate draft) |
| `lock_expires_at` | ISO datetime | Lock expiry (safety valve) |
| `sent_at` | ISO datetime | When the reply was sent |
| `sent_message_id` | string | Gmail message ID of the sent reply |
| `error_message` | string | Last error if status is `failed` or `send_failed` |
| `error_count` | string (int) | Cumulative error count |
| `created_at` | ISO datetime | Row creation time |
| `updated_at` | ISO datetime | Last modified time |

### Status Lifecycle

```
pending_review  ──► draft_ready  ──► sending  ──► sent
      │               │                              │
      │               └──► failed                    │
      │                                              │
      ├──► no_reply_needed                           │
      │                                              │
      └──► archived ◄────────────────────────────────┘
```

| Status | Meaning |
|--------|---------|
| `pending_review` | Newly ingested, awaiting draft generation |
| `draft_ready` | AI draft generated, awaiting agent approval |
| `sending` | Send in progress (transient) |
| `sent` | Reply sent successfully |
| `failed` | Draft generation failed |
| `send_failed` | Gmail send failed |
| `no_reply_needed` | Agent marked as no reply required |
| `archived` | Hidden from main queue |

---

## WF1 — Email Intake (Background)

**ID:** `DYmTKLtNP11h7kEH`
**Trigger:** Schedule — every 2 minutes
**Purpose:** Fetch all unread Gmail messages, deduplicate against existing queue, AI-categorise new ones, write to DataTable.

### Why batch polling instead of Gmail Trigger?

The built-in n8n `Gmail Trigger` node uses polling and creates **one execution per email**. With a 1-minute minimum poll interval, a batch of 30 emails would take 30 minutes to ingest. The schedule + batch approach ingests all pending emails in a single 2-minute cycle.

### Node flow

```
Every 2 Minutes
      │
      ▼
Get Unread Emails  (Gmail – getAll, filter: in:inbox is:unread, limit 50)
      │
      ▼
Get Existing IDs   (DataTable – get all rows, returnAll=true)
      │
      ▼
Filter New Only    (Code – set difference: Gmail IDs not in DataTable)
      │  (if 0 new emails → workflow ends here, no further cost)
      ▼
AI Categorizer     (OpenAI node – gpt-4o-mini via OpenRouter)
      │  (runs for EACH new email, in parallel)
      ▼
Format Data        (Code – merge AI output + Gmail fields into DataTable schema)
      │
      ▼
Mirror to Reply Queue  (DataTable – insert row)
```

### Key implementation detail: deduplication

The `Filter New Only` code node builds a `Set` of `gmail_message_id` values already in the DataTable, then filters the fresh Gmail list to only items not in that set. This means:

- If a new batch has 30 emails but 10 are already in the queue (e.g. from a previous cycle), only 20 are processed.
- Re-running the workflow never creates duplicate rows.

```js
const existingIds = new Set(
  $('Get Existing IDs').all()
    .map(i => i.json.gmail_message_id)
    .filter(Boolean)
);
const newItems = $('Get Unread Emails').all()
  .filter(item => !existingIds.has(item.json.id));
```

### Key implementation detail: batch Format Data

After the AI Categorizer runs, it returns one output item per input email (n8n processes each item through the node). The `Format Data` node uses `$input.all()` + `$('Filter New Only').all()` zipped by index to merge AI classifications with original Gmail fields:

```js
const aiItems = $input.all();
const gmailItems = $('Filter New Only').all();

return aiItems.map((aiItem, i) => {
  const g = (gmailItems[i] || {}).json || {};
  // parse AI JSON, map Gmail fields to DataTable schema
});
```

### Gmail field mapping

The `Gmail Get Messages` node (used here) returns different field names from the `Gmail Trigger` node:

| Gmail Trigger field | Gmail Get Messages field |
|--------------------|-----------------------|
| `from.value[0].address` | `From` (string, may include name) |
| `subject` | `Subject` |
| `text` | `snippet` (first ~160 chars only) |
| `date` | `internalDate` (Unix ms as string) |
| `id` | `id` |
| `threadId` | `threadId` |

The `From` field from Get Messages comes as either `"email@example.com"` or `"Name <email@example.com>"`. The Format Data node parses both with a regex:

```js
const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/) || ['','',fromRaw];
```

### Priority mapping

| Category | Priority value | Reasoning |
|----------|---------------|-----------|
| `financial_docs` | 1 | Highest — time-sensitive compliance docs |
| `inquiry` | 2 | Buyer enquiries need fast response |
| `appointment` | 2 | Viewing requests need fast response |
| `rental_application` | 3 | Important but less time-critical |
| `unrelated` | 5 | Lowest — spam/newsletters |

---

## WF2H — List Queue

**ID:** `Zg7u1KbICAbc1NFb`
**Webhook:** `GET /webhook/re-list`
**Purpose:** Return paginated, filtered, sorted queue rows to the dashboard.

### Query parameters

| Param | Default | Description |
|-------|---------|-------------|
| `status` | (all) | Filter by status value |
| `limit` | 50 | Page size |
| `offset` | 0 | Pagination offset |

### Node flow

```
GET /webhook/re-list?status=pending_review&limit=25&offset=0
      │
      ▼
Get Queue Rows  (DataTable – get all, returnAll=true)
      │
      ▼
Filter & Paginate  (Code – filter by status, sort, slice)
      │
      ▼
Respond to Webhook  → { rows: [...], total: N, limit, offset }
```

### Sort order

Rows are sorted by `priority` (ascending, lower = higher priority), then by `received_at` (descending, newest first within same priority).

---

## WF2G — Get Row

**ID:** `Qh1KnGk5BKDMgr3I`
**Webhook:** `GET /webhook/re-row?rowId=123`
**Purpose:** Fetch a single row by ID (for the detail pane).

### Node flow

```
GET /webhook/re-row?rowId=123
      │
      ▼
Get Queue Rows  (DataTable – get all)
      │
      ▼
Find Row  (Code – rows.find(r => String(r.id) === String(rowId)))
      │
      ▼
Respond to Webhook  → { row: {...} }
```

---

## WFA — Generate Draft

**ID:** `gH9tI9I1U4ie2zHC`
**Webhook:** `POST /webhook/re-generate-draft`
**Body:** `{ rowId: "123", instructions: "optional override" }`
**Purpose:** Lock the row, call AI to write a reply draft, save it back.

### Node flow

```
POST /webhook/re-generate-draft
      │
      ▼
Get Queue Rows
      │
      ▼
Validate Request  (Code)
  ├─► invalid → Respond Validation Error (400/404/423/409)
  └─► valid ──►
      │
      ▼
Build Lock Payload  (Code – set locked=true, locked_by='wfa')
      │
      ▼
Lock Row  (DataTable – update)
      │
      ▼
Build Prompt  (Code – assemble email context for AI)
      │
      ▼
Generate Draft  (AI Agent node – OpenRouter via OpenAI-compatible API)
      │
      ▼
Build Update Payload  (Code – set status=draft_ready, draft_text, unlock row)
      │
      ▼
Write Result  (DataTable – update)
      │
      ▼
Respond Result  → { success: true, draft_text: "..." }
```

### Validation rules

- `rowId` must be present
- Row must exist in DataTable
- Row must not be locked (`locked !== true`)
- Status must be one of: `pending_review`, `draft_ready`, `failed`

### Locking pattern

The row is locked (`locked=true, locked_by='wfa'`) before the AI call and unlocked after. This prevents the dashboard from showing a stale state or allowing double-submission while generation is in progress. The dashboard UI shows a "Generating draft…" shimmer when it detects a locked row with `locked_by='wfa'`.

### AI prompt construction

```js
const parts = [
  'Email category: ' + row.email_category,
  'Customer: ' + row.customer_name,
  'Subject: ' + row.email_subject,
  'Message: ' + row.email_body_full,
  'Summary: ' + row.email_summary,
];
if (instructions) parts.push('Instructions: ' + instructions);
```

---

## WFC — Approve & Send

**ID:** `IqidW8hrIY2vaPFP`
**Webhook:** `POST /webhook/re-send`
**Body:** `{ rowId: "123", finalDraft: "optional edited draft text" }`
**Purpose:** Send the reply email via Gmail, then mark row as sent.

### Node flow

```
POST /webhook/re-send
      │
      ▼
Get Queue Rows
      │
      ▼
Validate Request  (Code)
  ├─► invalid → Respond Validation Error
  └─► valid ──►
      │
      ▼
Lock Row  (DataTable – update)
      │
      ▼
Build HTML Email  (Code – wrap draft text in minimal HTML)
      │
      ▼
Send Reply  (Gmail – reply in thread using gmail_thread_id)
      │
      ▼
Mark as Read  (Gmail – mark original message as read)
      │
      ▼
Build Sent Payload  (Code – set status=sent, sent_at, sent_message_id)
      │
      ▼
Update Row Sent  (DataTable – update)
      │
      ▼
Respond Sent  → { success: true, status: "sent" }
```

### Validation rules

- `rowId` present
- Row exists
- Row not locked
- Status must be `draft_ready`
- `gmail_message_id` must be present (required to thread the reply)
- `finalDraft` (from body) or `draft_text` (from row) must be non-empty

### Note on `finalDraft`

The dashboard allows agents to edit the draft text before sending. The edited version is passed as `finalDraft` in the request body. If not provided, the saved `draft_text` from the row is used.

---

## WFB — Mark No-Reply

**ID:** `ry88tCTs3oKjjhAL`
**Webhook:** `POST /webhook/re-no-reply`
**Body:** `{ rowId: "123", notes: "optional" }`
**Purpose:** Mark an email as requiring no reply (e.g. spam, newsletter).

### Node flow

```
POST /webhook/re-no-reply → Validate → Update Row (status=no_reply_needed) → Respond
```

---

## WFD — Archive

**ID:** `KobSqJ9sbWOCEX3o`
**Webhook:** `POST /webhook/re-archive`
**Body:** `{ rowId: "123", archive_reason: "optional" }`
**Purpose:** Archive a row (removes it from the active queue view).

### Node flow

```
POST /webhook/re-archive → Validate → Update Row (status=archived) → Respond
```

---

## WFE — Unlock & Reset

**ID:** `RwrAYJx0XvSLPLA9`
**Webhook:** `POST /webhook/re-unlock`
**Body:** `{ rowId: "123", resetStatus: "pending_review" }`
**Purpose:** Release a stuck lock (e.g. if WFA timed out mid-run) and optionally reset the status.

### Node flow

```
POST /webhook/re-unlock → Validate → Update Row (locked=false, status=resetStatus) → Respond
```

---

## Credentials Used

| Credential | n8n ID | Used in |
|-----------|--------|---------|
| Gmail OAuth2 (`property.agent.demo@gmail.com`) | `VcLjSm5vjePd5FQs` | WF1 (read), WFC (send + mark read) |
| OpenRouter AI (OpenAI-compatible) | `rBhtyxKU39k0lhru` | WF1 (categorise), WFA (generate draft) |

---

## Reuse Guide — Applying This Pattern to Other Projects

This architecture is a general-purpose **email triage + AI reply queue** pattern. To reuse:

### 1. Replace the DataTable

n8n DataTables are the storage layer here. For projects needing SQL, replace all DataTable nodes with Postgres/Supabase nodes. The schema above maps directly to a SQL table.

### 2. Adapt WF1 for different inboxes

- **Different Gmail account:** swap the credential on `Get Unread Emails`
- **Different email filter:** change the `q` parameter on the Gmail node (e.g. `label:support is:unread`)
- **Non-Gmail inbox:** replace `Get Unread Emails` with IMAP, Outlook, or any supported mail node; update the field mapping in `Format Data`
- **Multiple inboxes:** duplicate WF1 per inbox, or add a merge node before `AI Categorizer`

### 3. Adapt the AI categorisation

Change the system prompt in `AI Categorizer` to return different categories. Update `categoryMap` in `Format Data` and update priority values to match your triage logic.

### 4. Adapt the AI draft prompt

Edit `Build Prompt` in WFA to include context relevant to your use case (e.g. product catalogue for e-commerce support, property details for real estate).

### 5. Scale beyond 50 emails per cycle

The Gmail node is capped at `limit: 50`. For higher-volume inboxes:
- Set `returnAll: true` on the Gmail node (fetches all unread in one call)
- Be aware this increases AI costs since every new email triggers an OpenAI call

### 6. Real-time vs polling

For true real-time ingestion, replace the Schedule Trigger + Gmail Get with a **Gmail push notification** via Google Pub/Sub (webhook-triggered). The rest of the workflow stays identical. See Google's [Gmail Push Notifications guide](https://developers.google.com/gmail/api/guides/push) for setup.

---

## Common Debugging Patterns

### Check if WF1 is ingesting emails

```bash
curl "https://n8n.srv823907.hstgr.cloud/api/v1/executions?workflowId=DYmTKLtNP11h7kEH&limit=10" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

Look at `Filter New Only` item count. If it's always 0, there are no new unread emails in the inbox. If it's non-zero but `Mirror to Reply Queue` is 0, there's a processing error.

### Check the live queue

```bash
curl "https://n8n.srv823907.hstgr.cloud/webhook/re-list?limit=200"
```

### Email not appearing in dashboard

1. Check Gmail — is it in INBOX and UNREAD? (Emails in Promotions/Social tabs are INBOX but Gmail may auto-mark as read)
2. Check WF1 execution history for errors
3. Check if `gmail_message_id` already exists in DataTable (deduplication may have skipped it)

### Dashboard showing mock data

Verify `VITE_USE_LIVE_API=true` is set in `.env.production`. This is baked into the Vite build at compile time — a runtime env change has no effect.
