# Real Estate Email Reply Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete human-in-the-loop email reply system for a real estate agent demo: Gmail intake → AI draft → React dashboard → one-click approve and send.

**Architecture:** 8 n8n workflows tagged `[REALESTATE DEMO]` handle all backend logic (intake, AI drafting, sending, utilities). A React/Vite dashboard on Vercel is the operator UI. All data lives in a single n8n Data Table: `[REALESTATE DEMO] Reply Queue`.

**Tech Stack:** n8n REST API, OpenRouter (claude-sonnet-4 via juEnxEIU4i1dAQCx credential), Gmail (VcLjSm5vjePd5FQs), React 18, Vite 5, Tailwind CSS 3, Vercel.

---

## Prerequisites

- n8n instance: `https://n8n.srv823907.hstgr.cloud`
- n8n API key: `$N8N_API_KEY` from `~/.env`
- Gmail credential ID: `VcLjSm5vjePd5FQs` (Property Agent Demo)
- OpenRouter credential ID: `juEnxEIU4i1dAQCx`
- Reference workflow (read-only): `dRBo95BrvhdSzvAd`
- Spec: `docs/superpowers/specs/2026-03-25-realestate-email-reply-dashboard-design.md`

Load env before all n8n API calls:
```bash
source ~/.env
```

---

## File Map

### n8n (configured via REST API — no local files)
- Data Table: `[REALESTATE DEMO] Reply Queue` (created in n8n UI or API)
- 8 workflows (created via n8n REST API, activated, Docker restarted once at end of Phase 1)

### React App (`/Users/ambrosevoon/Projects/realestate-demo2/`)
| File | Responsibility |
|------|---------------|
| `index.html` | Vite entry point |
| `vite.config.js` | Dev proxy `/webhook → n8n`, React plugin |
| `package.json` | Dependencies |
| `.env.example` | `VITE_N8N_URL`, `VITE_USE_LIVE_API` |
| `.env.local` | Local secrets (gitignored) |
| `src/main.jsx` | React root mount |
| `src/index.css` | Tailwind base + dark scrollbar |
| `src/App.jsx` | Root layout, `activeTab`, `selectedRowId`, `viewedIds` Set |
| `src/api/n8n.js` | 7 webhook API functions — wired from day one |
| `src/data/mockData.js` | 6 seed emails covering all categories + statuses |
| `src/hooks/useEmailQueue.js` | `rows`, actions, 60s poll loop |
| `src/components/layout/Sidebar.jsx` | Tabs (Inbox/Sent/Archive), counts |
| `src/components/layout/TopBar.jsx` | Title, Refresh button |
| `src/components/email/EmailList.jsx` | Filtered list, category pills, unviewed highlight |
| `src/components/detail/EmailDetail.jsx` | Original email, AI summary, draft textarea |
| `src/components/detail/ActionButtons.jsx` | Status-aware buttons, auto-trigger WFA |
| `src/components/ui/StatusBadge.jsx` | Coloured status pill |

---

## Phase 1 — n8n Data Table + Safety Net (WFE)

### Task 1: Create the Reply Queue Data Table

**Files:** n8n UI (no local files)

- [ ] **Step 1: Open n8n Data Tables**

  Go to `https://n8n.srv823907.hstgr.cloud` → Data → Tables → New Table

- [ ] **Step 2: Name the table**

  Name: `[REALESTATE DEMO] Reply Queue`

- [ ] **Step 3: Add all columns**

  Add each column in order (all type: String unless noted):
  ```
  source_row_id, gmail_message_id, gmail_thread_id,
  email_from, email_from_name, email_subject,
  email_body_snippet, email_body_full, received_at,
  customer_name, customer_email, customer_phone,
  email_category, email_urgency, email_summary, key_issues,
  status, priority,
  draft_text, draft_generated_at, draft_generation_attempts,
  locked, locked_by, lock_expires_at,
  error_message, error_count,
  archived_at, archive_reason,
  created_at, updated_at, sent_at, sent_message_id,
  reviewed_by, notes, no_reply_reason
  ```

- [ ] **Step 4: Note the table ID**

  After saving, the table URL will contain the table ID (e.g. `abc123`). Save it:
  ```bash
  export RE_TABLE_ID="<table-id-from-url>"
  ```

- [ ] **Step 5: Verify via API**

  ```bash
  source ~/.env
  curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "https://n8n.srv823907.hstgr.cloud/api/v1/data/$RE_TABLE_ID/rows" | python3 -m json.tool
  ```
  Expected: `{ "count": 0, "rows": [] }`

- [ ] **Step 6: Commit**

  ```bash
  cd /Users/ambrosevoon/Projects/realestate-demo2
  echo "RE_TABLE_ID=$RE_TABLE_ID" >> .env.local
  git add .env.local
  git commit -m "chore: record Reply Queue table ID"
  ```

---

### Task 2: Build WFE — Unlock & Reset (Admin Safety Net)

**Build this first. Without it, stuck locks will jam the queue permanently.**

- [ ] **Step 1: Create the workflow via API**

  ```bash
  source ~/.env
  curl -s -X POST \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/api/v1/workflows" \
    -d '{
      "name": "[REALESTATE DEMO] WFE – Unlock & Reset",
      "tags": [{"name": "REALESTATE DEMO"}],
      "nodes": [
        {
          "id": "wfe-webhook",
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 2,
          "position": [200, 300],
          "webhookId": "re-wfe-unlock-001",
          "parameters": {
            "httpMethod": "POST",
            "path": "re-unlock",
            "responseMode": "responseNode"
          }
        },
        {
          "id": "wfe-getrows",
          "name": "Get Queue Rows",
          "type": "n8n-nodes-base.dataTable",
          "typeVersion": 1,
          "position": [400, 300],
          "parameters": {
            "operation": "get",
            "dataTableId": { "__rl": true, "value": "RE_TABLE_ID_PLACEHOLDER", "mode": "list" },
            "returnAll": true
          }
        },
        {
          "id": "wfe-validate",
          "name": "Validate & Build Payload",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [600, 300],
          "parameters": {
            "jsCode": "const body = $('\''Webhook'\'').first().json.body;\nconst rowId = body?.rowId;\nif (!rowId) return [{ json: { error: '\''rowId required'\'', statusCode: 400 } }];\nconst rows = $input.all().map(i => i.json);\nconst row = rows.find(r => String(r.id) === String(rowId));\nif (!row) return [{ json: { error: '\''Row not found'\'', statusCode: 404 } }];\nconst validStatuses = ['\''pending_review'\'', '\''draft_ready'\'', '\''failed'\''];\nconst resetStatus = body.resetStatus || '\''pending_review'\'';\nif (!validStatuses.includes(resetStatus)) return [{ json: { error: '\''Invalid resetStatus'\'', statusCode: 400 } }];\nconst clearErrors = body.clearErrors === true;\nreturn [{ json: { ...row, status: resetStatus, locked: false, locked_by: '\'''\'', lock_expires_at: '\'''\'', error_message: clearErrors ? '\'''\'': (row.error_message || '\''\''\''), error_count: clearErrors ? 0 : (row.error_count || 0), updated_at: new Date().toISOString(), gmail_message_id: row.gmail_message_id, success: true } }];"
          }
        },
        {
          "id": "wfe-update",
          "name": "Update Row",
          "type": "n8n-nodes-base.dataTable",
          "typeVersion": 1,
          "position": [800, 300],
          "parameters": {
            "operation": "update",
            "dataTableId": { "__rl": true, "value": "RE_TABLE_ID_PLACEHOLDER", "mode": "list" },
            "filters": { "conditions": [{ "keyName": "gmail_message_id", "keyValue": "={{ $json.gmail_message_id }}" }] },
            "columns": { "mappingMode": "autoMapInputData" }
          }
        },
        {
          "id": "wfe-respond",
          "name": "Respond",
          "type": "n8n-nodes-base.respondToWebhook",
          "typeVersion": 1,
          "position": [1000, 300],
          "parameters": {
            "responseCode": 200,
            "responseBody": "={{ JSON.stringify($json) }}"
          }
        }
      ],
      "connections": {
        "Webhook": { "main": [[{ "node": "Get Queue Rows", "type": "main", "index": 0 }]] },
        "Get Queue Rows": { "main": [[{ "node": "Validate & Build Payload", "type": "main", "index": 0 }]] },
        "Validate & Build Payload": { "main": [[{ "node": "Update Row", "type": "main", "index": 0 }]] },
        "Update Row": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
      },
      "settings": { "executionOrder": "v1" }
    }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('WFE ID:', d.get('id','ERROR'), d.get('name',''))"
  ```

- [ ] **Step 2: Note the workflow ID, then update the table ID placeholder**

  In the n8n UI, open WFE and replace all `RE_TABLE_ID_PLACEHOLDER` strings with your actual `$RE_TABLE_ID`.

- [ ] **Step 3: Activate WFE**

  ```bash
  WFE_ID="<id-from-step-1>"
  curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "https://n8n.srv823907.hstgr.cloud/api/v1/workflows/$WFE_ID/activate"
  ```

- [ ] **Step 4: Restart n8n Docker to register webhook**

  SSH into VPS:
  ```bash
  ssh root@<vps-ip>
  cd /root  # or wherever docker-compose.yml lives
  docker compose restart n8n
  ```
  Wait ~30 seconds for n8n to come back up.

- [ ] **Step 5: Test WFE with a dummy rowId (expect 404)**

  ```bash
  curl -s -X POST \
    -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/webhook/re-unlock" \
    -d '{"rowId": "99999"}' | python3 -m json.tool
  ```
  Expected: `{ "error": "Row not found", "statusCode": 404 }`

- [ ] **Step 6: Commit workflow ID**

  ```bash
  echo "WFE_ID=$WFE_ID" >> .env.local
  git add .env.local
  git commit -m "feat(n8n): add WFE Unlock & Reset workflow"
  ```

---

## Phase 2 — Read APIs (WF2G + WF2H)

### Task 3: Build WF2G — Get Single Row

- [ ] **Step 1: Create WF2G via n8n UI**

  Create a new workflow named `[REALESTATE DEMO] WF2G – Get Row` with these nodes:

  **Node 1 — Webhook:**
  - Type: Webhook, typeVersion: 2
  - HTTP Method: GET, Path: `re-row`, Response Mode: Response Node
  - webhookId: `re-wf2g-getrow-001` (set in JSON editor)

  **Node 2 — Get Queue Rows:**
  - Type: Data Table → Get, returnAll: true
  - Table: `[REALESTATE DEMO] Reply Queue`

  **Node 3 — Find Row (Code):**
  ```javascript
  const rowId = $('Webhook').first().json.query.rowId;
  const rows = $input.all().map(i => i.json);
  const row = rows.find(r => String(r.id) === String(rowId));
  if (!row) return [{ json: { error: 'Row not found', rowId }, statusCode: 404 }];
  return [{ json: row }];
  ```

  **Node 4 — Respond to Webhook:**
  - responseCode: `200` (integer)
  - responseBody: `={{ JSON.stringify($json) }}`

  **Connections:** Webhook → Get Queue Rows → Find Row → Respond

- [ ] **Step 2: Activate WF2G**

  Use the toggle in the n8n UI or:
  ```bash
  curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
    "https://n8n.srv823907.hstgr.cloud/api/v1/workflows/<WF2G_ID>/activate"
  ```

- [ ] **Step 3: Test — missing rowId**

  ```bash
  curl -s "https://n8n.srv823907.hstgr.cloud/webhook/re-row" | python3 -m json.tool
  ```
  Expected: `{ "error": "Row not found" }` (rowId is undefined → finds no row → 404 body)

- [ ] **Step 5: Commit**

  ```bash
  echo "WF2G_ID=<id>" >> .env.local
  git add .env.local && git commit -m "feat(n8n): add WF2G Get Row"
  ```

---

### Task 4: Build WF2H — List Queue Rows

- [ ] **Step 1: Create WF2H via n8n UI**

  Name: `[REALESTATE DEMO] WF2H – List Queue`

  **Node 1 — Webhook:** GET, path `re-list`, webhookId `re-wf2h-list-001`, Response Node mode

  **Node 2 — Get Queue Rows:** Data Table → Get all rows, returnAll: true

  **Node 3 — Filter & Paginate (Code):**
  ```javascript
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

  **Node 4 — Respond:** responseCode: 200, body: `={{ JSON.stringify($json) }}`

- [ ] **Step 2: Activate WF2H** (no Docker restart needed — batch restart happens after all Phase 2–3 workflows are built)

- [ ] **Step 3: Test — list all rows (expect empty)**

  ```bash
  curl -s "https://n8n.srv823907.hstgr.cloud/webhook/re-list" | python3 -m json.tool
  ```
  Expected: `{ "rows": [], "total": 0, "limit": 50, "offset": 0 }`

- [ ] **Step 4: Commit**

  ```bash
  echo "WF2H_ID=<id>" >> .env.local
  git add .env.local && git commit -m "feat(n8n): add WF2H List Queue"
  ```

---

## Phase 3 — Core Action Workflows

### Task 5: Build WFA — Generate Draft

- [ ] **Step 1: Create WFA via n8n UI**

  Name: `[REALESTATE DEMO] WFA – Generate Draft`

  **Node 1 — Webhook:** POST, path `re-generate-draft`, webhookId `re-wfa-draft-001`, Response Node

  **Node 2 — Get Queue Rows:** returnAll: true

  **Node 3 — Validate Request (Code):**
  ```javascript
  const body = $('Webhook').first().json.body;
  const rowId = body?.rowId;
  if (!rowId) return [{ json: { valid: false, error: 'rowId required', statusCode: 400 } }];
  const rows = $input.all().map(i => i.json);
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

  **Node 4 — Route (IF, typeVersion: 2.2, singleValue: true, combinator: "and"):**
  - Condition: `{{ $json.valid }}` equals `true`
  - Output 0 = error branch, Output 1 = ok branch

  **Node 5 — Respond Validation Error (error branch):**
  - responseCode: `={{ $('Validate Request').item.json.statusCode }}` (integer expression)
  - body: `={{ JSON.stringify({ error: $('Validate Request').item.json.error }) }}`

  **Node 6 — Lock Row (Data Table UPDATE, ok branch):**
  > ⚠️ DataTable UPDATE is fully destructive — send the complete row.
  - Operation: Update
  - Filter: `gmail_message_id` = `={{ $('Validate Request').item.json.row.gmail_message_id }}`
  - Map all columns from `$('Validate Request').item.json.row` plus overrides:
    - `locked`: `true`
    - `locked_by`: `wfa`
    - `lock_expires_at`: `={{ new Date(Date.now() + 5*60*1000).toISOString() }}`
    - `updated_at`: `={{ new Date().toISOString() }}`

  **Node 7 — Generate Draft (OpenRouter Chat Model, continueOnFail: true):**
  - Model: `anthropic/claude-sonnet-4`
  - Credential: `juEnxEIU4i1dAQCx`
  - System prompt:
    ```
    You are an email assistant for SmartFlow Automation, a real estate technology company.
    Write a professional reply on behalf of the Senior Sales Agent.
    Reply in plain text. No markdown. Professional Australian English.
    Sign off: "Senior Sales Agent | SmartFlow Automation"
    ```
  - User message:
    ```
    Email category: {{ $('Validate Request').item.json.row.email_category }}
    Customer: {{ $('Validate Request').item.json.row.customer_name }}
    Subject: {{ $('Validate Request').item.json.row.email_subject }}
    Message: {{ $('Validate Request').item.json.row.email_body_full }}
    Summary: {{ $('Validate Request').item.json.row.email_summary }}
    {{ $('Validate Request').item.json.instructions ? 'Owner instructions (internal only): ' + $('Validate Request').item.json.instructions : '' }}
    ```

  **Node 8 — Build Update Payload (Code):**
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
      draft_generation_attempts: (Number(prev.draft_generation_attempts) || 0) + 1,
      locked: false, locked_by: '', lock_expires_at: '',
      updated_at: new Date().toISOString(), success: false
    }}];
  }
  const draft = draftNode.json.message.content;
  return [{ json: { ...prev,
    status: 'draft_ready',
    draft_text: draft,
    draft_generated_at: new Date().toISOString(),
    draft_generation_attempts: (Number(prev.draft_generation_attempts) || 0) + 1,
    error_count: prev.error_count || 0,
    locked: false, locked_by: '', lock_expires_at: '',
    updated_at: new Date().toISOString(), success: true, draft_text_out: draft
  }}];
  ```

  **Node 9 — Write Result (Data Table UPDATE):**
  > ⚠️ DataTable UPDATE is fully destructive — send complete row from Build Update Payload.
  - Filter: `gmail_message_id` = `={{ $json.gmail_message_id }}`
  - Map all input columns (autoMapInputData)

  **Node 10 — Respond Result:**
  - responseCode: 200
  - body: `={{ JSON.stringify({ success: $json.success, draft: $json.draft_text_out, status: $json.status }) }}`

  **Connections:**
  - Webhook → Get Queue Rows → Validate Request → Route (IF)
  - Route output 0 (false) → Respond Validation Error
  - Route output 1 (true) → Lock Row → Generate Draft → Build Update Payload → Write Result → Respond Result

- [ ] **Step 2: Activate WFA** (no Docker restart yet — see Step 2a below after all Phase 3 workflows built)

- [ ] **Step 3: Test — missing rowId**

  ```bash
  curl -s -X POST -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/webhook/re-generate-draft" \
    -d '{}' | python3 -m json.tool
  ```
  Expected: `{ "error": "rowId required" }`

- [ ] **Step 4: Insert a test row then generate a draft**

  ```bash
  # Insert test row via n8n Data Table API
  curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/api/v1/data/$RE_TABLE_ID/rows" \
    -d '{
      "gmail_message_id": "test-msg-001",
      "gmail_thread_id": "test-thread-001",
      "email_from": "buyer@example.com",
      "email_from_name": "Test Buyer",
      "email_subject": "Enquiry about 13 Plunkett Turn",
      "email_body_full": "Hi, I am interested in the property at 13 Plunkett Turn. What is the price guide and when are the next inspections?",
      "email_category": "inquiry",
      "email_summary": "Buyer enquiring about price and inspection times for 13 Plunkett Turn",
      "customer_name": "Test Buyer",
      "status": "pending_review",
      "priority": "2",
      "locked": "false",
      "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('Row ID:', d.get('id'))"
  ```

  ```bash
  # Get the row ID, then generate draft
  TEST_ROW_ID=<id-from-above>
  curl -s -X POST -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/webhook/re-generate-draft" \
    -d "{\"rowId\": \"$TEST_ROW_ID\"}" | python3 -m json.tool
  ```
  Expected: `{ "success": true, "draft": "Dear Test Buyer...", "status": "draft_ready" }`

- [ ] **Step 5: Verify row in table is now draft_ready**

  ```bash
  curl -s "https://n8n.srv823907.hstgr.cloud/webhook/re-row?rowId=$TEST_ROW_ID" | python3 -c "import sys,json; d=json.load(sys.stdin); print('status:', d.get('status'), '| locked:', d.get('locked'))"
  ```
  Expected: `status: draft_ready | locked: False`

- [ ] **Step 6: Commit**

  ```bash
  git commit -m "feat(n8n): add WFA Generate Draft workflow"
  ```

---

### Task 6: Build WFC — Approve & Send

- [ ] **Step 1: Create WFC via n8n UI**

  Name: `[REALESTATE DEMO] WFC – Approve & Send`

  **Node 1 — Webhook:** POST, path `re-send`, webhookId `re-wfc-send-001`, Response Node

  **Node 2 — Get Queue Rows:** returnAll: true

  **Node 3 — Validate Request (Code):**
  ```javascript
  const body = $('Webhook').first().json.body;
  const rowId = body?.rowId;
  if (!rowId) return [{ json: { valid: false, error: 'rowId required', statusCode: 400 } }];
  const rows = $input.all().map(i => i.json);
  const row = rows.find(r => String(r.id) === String(rowId));
  if (!row) return [{ json: { valid: false, error: 'Row not found', statusCode: 404 } }];
  if (row.locked === true || row.locked === 'true') {
    return [{ json: { valid: false, error: 'Row is locked', statusCode: 423 } }];
  }
  if (row.status !== 'draft_ready') {
    return [{ json: { valid: false, error: `Status ${row.status} not eligible (need draft_ready)`, statusCode: 409 } }];
  }
  const finalDraft = body.finalDraft || row.draft_text;
  if (!finalDraft || finalDraft.trim() === '') {
    return [{ json: { valid: false, error: 'Draft cannot be empty', statusCode: 400 } }];
  }
  return [{ json: { valid: true, rowId, row, finalDraft, gmailMessageId: row.gmail_message_id } }];
  ```

  **Node 4 — Route (IF 2.2):** `$json.valid === true`

  **Node 5 — Respond Validation Error (false branch)**

  **Node 6 — Lock Row (Data Table UPDATE, true branch):**
  > ⚠️ Fully destructive — send complete row.
  - status: `sending`, locked: true, locked_by: `wfc`, lock_expires_at: `+3min`

  **Node 7 — Build HTML Email (Code):**
  ```javascript
  const validateData = $('Validate Request').item.json;
  const draft = validateData.finalDraft;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6">${draft.replace(/\n/g, '<br>')}</div>`;
  return [{ json: {
    htmlEmail: html,
    gmailMessageId: validateData.gmailMessageId,
    row: validateData.row,
    finalDraft: draft
  }}];
  ```

  **Node 8 — Send Reply (Gmail, typeVersion: 2.1):**
  > ⚠️ MUST be typeVersion 2.1 — v2.2 breaks expression evaluation for messageId.
  - Credential: `VcLjSm5vjePd5FQs`
  - Operation: Reply
  - messageId: `={{ $json.gmailMessageId }}`
  - message: `={{ $json.htmlEmail }}`
  - sendAsHtml: true

  **Node 9 — Add Replied Label (Gmail, typeVersion: 2.1):**
  - Operation: addLabels
  - messageId: `={{ $('Build HTML Email').item.json.gmailMessageId }}`
  - labelIds: Use the Gmail "Sent"/"Replied" label ID from the Property Agent Demo account

  **Node 10 — Mark as Read (Gmail, typeVersion: 2.1):**
  - Operation: markAsRead
  - messageId: `={{ $('Build HTML Email').item.json.gmailMessageId }}`

  **Node 11 — Update Row Sent (Data Table UPDATE):**
  > ⚠️ Fully destructive — send complete row.
  ```javascript
  // Build in a Code node before the DataTable node:
  const prev = $('Build HTML Email').item.json.row;
  const sentId = $input.first().json.id || '';
  return [{ json: { ...prev,
    status: 'sent',
    sent_at: new Date().toISOString(),
    sent_message_id: sentId,
    locked: false, locked_by: '', lock_expires_at: '',
    updated_at: new Date().toISOString()
  }}];
  ```

  **Node 12 — Respond Sent:**
  - responseCode: 200
  - body: `={{ JSON.stringify({ success: true, status: "sent" }) }}`

- [ ] **Step 2: Activate WFC**

- [ ] **Step 2a: Restart Docker once (after WF2G, WF2H, WFA, WFC are all activated)**

  ```bash
  ssh root@<vps-ip>
  cd /root && docker compose restart n8n
  ```
  Wait ~30 seconds. All Phase 2–3 webhooks are now live in memory.

- [ ] **Step 3: Test — send reply on the test row**

  ```bash
  curl -s -X POST -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/webhook/re-send" \
    -d "{\"rowId\": \"$TEST_ROW_ID\"}" | python3 -m json.tool
  ```
  Expected: `{ "success": true, "status": "sent" }`

- [ ] **Step 4: Verify in Gmail**

  Open Property Agent Demo Gmail → check Sent Items for the reply to the test thread.

- [ ] **Step 5: Verify row status**

  ```bash
  curl -s "https://n8n.srv823907.hstgr.cloud/webhook/re-row?rowId=$TEST_ROW_ID" | python3 -c "import sys,json; d=json.load(sys.stdin); print('status:', d.get('status'), '| sent_at:', d.get('sent_at'))"
  ```
  Expected: `status: sent | sent_at: 2026-...`

- [ ] **Step 6: Commit**

  ```bash
  git commit -m "feat(n8n): add WFC Approve & Send workflow"
  ```

---

### Task 7: Build WFB + WFD — Utility Workflows

Both follow the same pattern: Webhook → Get Rows → Validate → IF → Update Row → Respond.

- [ ] **Step 1: Build WFB — Mark No-Reply**

  Name: `[REALESTATE DEMO] WFB – Mark No-Reply`, path: `re-no-reply`, webhookId: `re-wfb-noreply-001`

  **Validate (Code):**
  ```javascript
  const body = $('Webhook').first().json.body;
  const rowId = body?.rowId;
  if (!rowId) return [{ json: { valid: false, error: 'rowId required', statusCode: 400 } }];
  const rows = $input.all().map(i => i.json);
  const row = rows.find(r => String(r.id) === String(rowId));
  if (!row) return [{ json: { valid: false, error: 'Row not found', statusCode: 404 } }];
  const eligible = ['pending_review', 'draft_ready', 'failed'];
  if (!eligible.includes(row.status)) {
    return [{ json: { valid: false, error: `Status ${row.status} not eligible`, statusCode: 409 } }];
  }
  return [{ json: { ...row, status: 'no_reply_needed', no_reply_reason: body.notes || '', updated_at: new Date().toISOString(), valid: true } }];
  ```

  **Update Row (Data Table UPDATE):**
  > ⚠️ Fully destructive — input from Validate node is already the full row.
  - Filter: `gmail_message_id` = `={{ $json.gmail_message_id }}`
  - autoMapInputData

  **Respond:** `{ "success": true, "status": "no_reply_needed" }`

- [ ] **Step 2: Build WFD — Archive**

  Name: `[REALESTATE DEMO] WFD – Archive`, path: `re-archive`, webhookId: `re-wfd-archive-001`

  **Validate (Code):**
  ```javascript
  const body = $('Webhook').first().json.body;
  const rowId = body?.rowId;
  if (!rowId) return [{ json: { valid: false, error: 'rowId required', statusCode: 400 } }];
  const rows = $input.all().map(i => i.json);
  const row = rows.find(r => String(r.id) === String(rowId));
  if (!row) return [{ json: { valid: false, error: 'Row not found', statusCode: 404 } }];
  const eligible = ['sent', 'no_reply_needed'];
  if (!eligible.includes(row.status)) {
    return [{ json: { valid: false, error: `Status ${row.status} not eligible`, statusCode: 409 } }];
  }
  return [{ json: { ...row, status: 'archived', archived_at: new Date().toISOString(), archive_reason: body.archive_reason || '', updated_at: new Date().toISOString(), valid: true } }];
  ```

- [ ] **Step 3: Activate both WFB and WFD** (no additional Docker restart needed — WFE restart from Task 2 covers Phase 1; Phase 2–3 restart covers WF2G/WF2H/WFA/WFC/WFB/WFD)

- [ ] **Step 4: Test WFB**

  ```bash
  # Insert another test row first
  curl -s -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/api/v1/data/$RE_TABLE_ID/rows" \
    -d '{"gmail_message_id":"test-msg-002","status":"pending_review","email_subject":"Spam test","priority":"5","locked":"false","created_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

  SPAM_ROW_ID=<id-from-above>
  curl -s -X POST -H "Content-Type: application/json" \
    "https://n8n.srv823907.hstgr.cloud/webhook/re-no-reply" \
    -d "{\"rowId\": \"$SPAM_ROW_ID\", \"notes\": \"Spam\"}" | python3 -m json.tool
  ```
  Expected: `{ "success": true, "status": "no_reply_needed" }`

- [ ] **Step 5: Commit**

  ```bash
  git commit -m "feat(n8n): add WFB Mark No-Reply and WFD Archive workflows"
  ```

---

## Phase 4 — Email Intake (WF1)

### Task 8: Build WF1 — Email Intake

This workflow is the full replica of `dRBo95BrvhdSzvAd` with the mirror node appended.

- [ ] **Step 1: Open reference workflow (read-only)**

  In n8n UI, open `dRBo95BrvhdSzvAd` to see all node configurations. Do NOT save or modify it.

- [ ] **Step 2: Create WF1 via n8n UI**

  Name: `[REALESTATE DEMO] WF1 – Email Intake`

  Build the following nodes (replicate from reference):

  **Node: NEW EMAIL (Gmail Trigger)**
  - Credential: `VcLjSm5vjePd5FQs`
  - Poll Mode: Every Minute (or as preferred)
  - Filters: All email (no filter)

  **Node: AI Categorizer (OpenAI/OpenRouter)**
  - Credential: `juEnxEIU4i1dAQCx`
  - System prompt: Classify email into one of: `inquiry`, `appointment`, `rental_application`, `financial_docs`, `unrelated`. Extract: `customer_name`, `customer_email`, `customer_phone`, `category`, `summary`. Return JSON only.
  - User message: `={{ $json.text }}`

  **5 IF nodes (typeVersion: 2.2):** One per category checking `$('AI Categorizer').item.json.message.content.category`

  **Gmail label/read nodes per category:** Use same label IDs as reference workflow.

  **AI Agent node (for inquiry/appointment):** Same as reference — OpenRouter model, Google Calendar tool, Gmail draft tool.

  **Node: Format Data (Code)**
  ```javascript
  const categoryMap = { inquiry: 2, appointment: 2, rental_application: 3, financial_docs: 1, unrelated: 5 };
  const aiData = JSON.parse($('AI Categorizer').item.json.message.content || '{}');
  const category = aiData.category || 'unrelated';
  return [{ json: {
    gmail_message_id: $('NEW EMAIL').item.json.id,
    gmail_thread_id: $('NEW EMAIL').item.json.threadId,
    email_from: $('NEW EMAIL').item.json.from?.value?.[0]?.address || '',
    email_from_name: $('NEW EMAIL').item.json.from?.value?.[0]?.name || '',
    email_subject: $('NEW EMAIL').item.json.subject || '',
    email_body_snippet: ($('NEW EMAIL').item.json.text || '').slice(0, 500),
    email_body_full: $('NEW EMAIL').item.json.text || '',
    received_at: $('NEW EMAIL').item.json.date || new Date().toISOString(),
    customer_name: aiData.customer_name || '',
    customer_email: aiData.customer_email || '',
    customer_phone: aiData.customer_phone || '',
    email_category: category,
    email_summary: aiData.summary || '',
    status: 'pending_review',
    priority: String(categoryMap[category] || 5),
    locked: 'false',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }}];
  ```

  **Node: Store Log in Google Sheets**
  - Same credential and spreadsheet as reference workflow (append row)

  **Node: Dedup Check (Code)** — passthrough for demo:
  ```javascript
  return [{ json: { ...$input.first().json, shouldMirror: true } }];
  ```

  **Node: Mirror to Reply Queue (Data Table INSERT, continueOnFail: true)**
  > ⚠️ Set continueOnFail: true — mirror failure must never block email intake.
  - Table: `[REALESTATE DEMO] Reply Queue`
  - Map all columns from Format Data node output

- [ ] **Step 3: Wire connections**

  All 5 category branches converge → Format Data → Google Sheets → Dedup Check → Mirror to Reply Queue

- [ ] **Step 4: Activate WF1**

- [ ] **Step 5: Send a test email to Property Agent Demo Gmail**

  From any email account, send:
  ```
  To: [property agent demo gmail address]
  Subject: Interested in 13 Plunkett Turn
  Body: Hi, I'm a buyer interested in the property at 13 Plunkett Turn. Can you tell me the price guide and the next inspection times? My phone is 0412 555 000.
  ```

- [ ] **Step 6: Verify row appears in queue**

  ```bash
  curl -s "https://n8n.srv823907.hstgr.cloud/webhook/re-list" | python3 -c "
  import sys,json
  d=json.load(sys.stdin)
  print('Total rows:', d['total'])
  for r in d['rows']:
      print(f'  [{r[\"status\"]}] {r[\"email_subject\"]} — {r[\"email_category\"]}')
  "
  ```
  Expected: new row with status `pending_review`, category `inquiry`

- [ ] **Step 7: Commit**

  ```bash
  git commit -m "feat(n8n): add WF1 Email Intake with mirror node"
  ```

---

## Phase 5 — React App Foundation

### Task 9: Scaffold React/Vite Project

**Files:** `index.html`, `vite.config.js`, `package.json`, `src/main.jsx`, `src/index.css`, `.env.example`

- [ ] **Step 1: Initialise project**

  ```bash
  cd /Users/ambrosevoon/Projects/realestate-demo2
  npm create vite@latest . -- --template react
  # Choose: React, JavaScript
  npm install
  npm install -D tailwindcss @tailwindcss/vite
  ```

- [ ] **Step 2: Configure Tailwind**

  Update `vite.config.js`:
  ```javascript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [react(), tailwindcss()],
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

  Update `src/index.css`:
  ```css
  @import "tailwindcss";

  :root {
    --bg: #080d1a;
    --surface: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.10);
    --text: #e2e8f0;
    --muted: #94a3b8;
    --accent: #22d3ee;
  }

  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
  ```

- [ ] **Step 3: Create `.env.example`**

  ```
  VITE_N8N_URL=https://n8n.srv823907.hstgr.cloud
  VITE_USE_LIVE_API=false
  ```

  Create `.env.local`:
  ```
  VITE_N8N_URL=https://n8n.srv823907.hstgr.cloud
  VITE_USE_LIVE_API=false
  ```

- [ ] **Step 4: Add `.env.local` to `.gitignore`**

  ```bash
  echo ".env.local" >> .gitignore
  ```

- [ ] **Step 5: Replace `src/App.jsx` with minimal shell**

  ```jsx
  export default function App() {
    return (
      <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
        <div style={{ color: 'var(--accent)', padding: '2rem' }}>SmartFlow Automation — Email Dashboard</div>
      </div>
    )
  }
  ```

- [ ] **Step 6: Run dev server and verify**

  ```bash
  npm run dev
  ```
  Open `http://localhost:5173` — expect cyan text on dark background.

- [ ] **Step 7: Commit**

  ```bash
  git add -A && git commit -m "feat(ui): scaffold React/Vite project with Tailwind dark theme"
  ```

---

### Task 10: API Layer + Mock Data

**Files:** `src/api/n8n.js`, `src/data/mockData.js`

- [ ] **Step 1: Create `src/api/n8n.js`**

  ```javascript
  const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n.srv823907.hstgr.cloud';

  async function call(path, options = {}) {
    const res = await fetch(`${N8N_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.error || `HTTP ${res.status}`), { statusCode: res.status });
    }
    return res.json();
  }

  export const api = {
    listQueue: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return call(`/webhook/re-list${qs ? '?' + qs : ''}`);
    },
    getRow: (rowId) => call(`/webhook/re-row?rowId=${rowId}`),
    generateDraft: (rowId, instructions = '') =>
      call('/webhook/re-generate-draft', {
        method: 'POST',
        body: JSON.stringify({ rowId, instructions }),
      }),
    sendReply: (rowId, finalDraft) =>
      call('/webhook/re-send', {
        method: 'POST',
        body: JSON.stringify({ rowId, finalDraft }),
      }),
    markNoReply: (rowId, notes = '') =>
      call('/webhook/re-no-reply', {
        method: 'POST',
        body: JSON.stringify({ rowId, notes }),
      }),
    archive: (rowId, archive_reason = '') =>
      call('/webhook/re-archive', {
        method: 'POST',
        body: JSON.stringify({ rowId, archive_reason }),
      }),
    unlock: (rowId, resetStatus = 'pending_review', clearErrors = false) =>
      call('/webhook/re-unlock', {
        method: 'POST',
        body: JSON.stringify({ rowId, resetStatus, clearErrors }),
      }),
  };
  ```

- [ ] **Step 2: Create `src/data/mockData.js`**

  ```javascript
  export const mockRows = [
    {
      id: '1', status: 'pending_review', priority: '2',
      email_from: 'sarah.chen@gmail.com', email_from_name: 'Sarah Chen',
      email_subject: 'Enquiry about 13 Plunkett Turn',
      email_body_full: 'Hi, I saw the listing for 13 Plunkett Turn and I\'m very interested. Could you tell me the price guide and when the next inspection is? My number is 0412 888 001.',
      email_category: 'inquiry', email_summary: 'Buyer enquiring about price and inspection times.',
      customer_name: 'Sarah Chen', customer_phone: '0412 888 001',
      received_at: new Date(Date.now() - 3600000).toISOString(),
      draft_text: '', locked: false, locked_by: '', created_at: new Date().toISOString()
    },
    {
      id: '2', status: 'draft_ready', priority: '2',
      email_from: 'mark.jones@hotmail.com', email_from_name: 'Mark Jones',
      email_subject: 'Inspection booking request',
      email_body_full: 'Hello, I would like to book in for the Saturday inspection at 10am. My name is Mark Jones, 0413 555 002.',
      email_category: 'appointment', email_summary: 'Buyer wants to book Saturday 10am inspection.',
      customer_name: 'Mark Jones', customer_phone: '0413 555 002',
      received_at: new Date(Date.now() - 7200000).toISOString(),
      draft_text: 'Dear Mark,\n\nThank you for your interest in attending the inspection at 13 Plunkett Turn this Saturday at 10:00am.\n\nWe have noted your attendance. We look forward to seeing you there.\n\nSenior Sales Agent | SmartFlow Automation',
      locked: false, locked_by: '', created_at: new Date().toISOString()
    },
    {
      id: '3', status: 'pending_review', priority: '3',
      email_from: 'lisa.wong@gmail.com', email_from_name: 'Lisa Wong',
      email_subject: 'Rental application — 13 Plunkett Turn',
      email_body_full: 'Hi, I would like to submit a rental application for the property. Please send me the application form. Contact: 0414 777 003.',
      email_category: 'rental_application', email_summary: 'Tenant requesting rental application form.',
      customer_name: 'Lisa Wong', customer_phone: '0414 777 003',
      received_at: new Date(Date.now() - 10800000).toISOString(),
      draft_text: '', locked: false, locked_by: '', created_at: new Date().toISOString()
    },
    {
      id: '4', status: 'sent', priority: '1',
      email_from: 'david.kim@westpac.com', email_from_name: 'David Kim',
      email_subject: 'Finance pre-approval documents',
      email_body_full: 'Please find attached our pre-approval certificate for $950,000.',
      email_category: 'financial_docs', email_summary: 'Buyer sending finance pre-approval docs.',
      customer_name: 'David Kim', customer_phone: '',
      received_at: new Date(Date.now() - 86400000).toISOString(),
      draft_text: 'Dear David,\n\nThank you for providing your finance pre-approval documentation. We have forwarded this to the vendor for their records.\n\nSenior Sales Agent | SmartFlow Automation',
      sent_at: new Date(Date.now() - 80000000).toISOString(),
      locked: false, locked_by: '', created_at: new Date().toISOString()
    },
    {
      id: '5', status: 'no_reply_needed', priority: '5',
      email_from: 'noreply@realestate.com.au', email_from_name: 'realestate.com.au',
      email_subject: 'Your listing has been updated',
      email_body_full: 'Your listing for 13 Plunkett Turn has been updated successfully.',
      email_category: 'unrelated', email_summary: 'Automated notification from portal.',
      customer_name: '', customer_phone: '',
      received_at: new Date(Date.now() - 172800000).toISOString(),
      draft_text: '', locked: false, locked_by: '', created_at: new Date().toISOString()
    },
    {
      id: '6', status: 'failed', priority: '2',
      email_from: 'emma.roberts@icloud.com', email_from_name: 'Emma Roberts',
      email_subject: 'Question about the property',
      email_body_full: 'Is the property still available? I am very interested.',
      email_category: 'inquiry', email_summary: 'Buyer asking if property is still available.',
      customer_name: 'Emma Roberts', customer_phone: '',
      received_at: new Date(Date.now() - 1800000).toISOString(),
      draft_text: '', error_message: 'AI generation failed: timeout', error_count: 1,
      locked: false, locked_by: '', created_at: new Date().toISOString()
    },
  ];
  ```

- [ ] **Step 3: Verify mock data loads**

  Add a quick test to `App.jsx`:
  ```jsx
  import { mockRows } from './data/mockData'
  console.log('Mock rows:', mockRows.length) // should log 6
  ```

- [ ] **Step 4: Remove the console.log after verifying**

- [ ] **Step 5: Commit**

  ```bash
  git add src/api/n8n.js src/data/mockData.js && git commit -m "feat(ui): add API layer and mock data"
  ```

---

### Task 11: useEmailQueue Hook

**Files:** `src/hooks/useEmailQueue.js`

- [ ] **Step 1: Create `src/hooks/useEmailQueue.js`**

  ```javascript
  import { useState, useEffect, useRef, useCallback } from 'react';
  import { api } from '../api/n8n';
  import { mockRows } from '../data/mockData';

  const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

  export function useEmailQueue() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const actionInFlight = useRef(false);

    const refresh = useCallback(async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        if (USE_LIVE_API) {
          const data = await api.listQueue({ limit: 100 });
          setRows(data.rows);
        } else {
          setRows([...mockRows]);
        }
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        if (!silent) setLoading(false);
      }
    }, []);

    // Initial load + 60s poll
    useEffect(() => {
      refresh();
      const interval = setInterval(() => {
        if (!actionInFlight.current) refresh(true);
      }, 60000);
      return () => clearInterval(interval);
    }, [refresh]);

    const withAction = async (fn) => {
      actionInFlight.current = true;
      try {
        await fn();
        await refresh(true);
      } finally {
        actionInFlight.current = false;
      }
    };

    const updateRowLocally = (rowId, patch) => {
      setRows(prev => prev.map(r => String(r.id) === String(rowId) ? { ...r, ...patch } : r));
    };

    return {
      rows,
      loading,
      error,
      refresh,
      generateDraft: (rowId, instructions) => withAction(async () => {
        updateRowLocally(rowId, { locked: true });
        if (USE_LIVE_API) await api.generateDraft(rowId, instructions);
        else updateRowLocally(rowId, { status: 'draft_ready', draft_text: 'Mock AI draft for demo purposes.\n\nSenior Sales Agent | SmartFlow Automation', locked: false });
      }),
      sendReply: (rowId, finalDraft) => withAction(async () => {
        updateRowLocally(rowId, { status: 'sending', locked: true });
        if (USE_LIVE_API) await api.sendReply(rowId, finalDraft);
        else updateRowLocally(rowId, { status: 'sent', locked: false, sent_at: new Date().toISOString() });
      }),
      markNoReply: (rowId, notes) => withAction(async () => {
        if (USE_LIVE_API) await api.markNoReply(rowId, notes);
        else updateRowLocally(rowId, { status: 'no_reply_needed' });
      }),
      archive: (rowId) => withAction(async () => {
        if (USE_LIVE_API) await api.archive(rowId);
        else updateRowLocally(rowId, { status: 'archived' });
      }),
      unlock: (rowId) => withAction(async () => {
        if (USE_LIVE_API) await api.unlock(rowId);
        else updateRowLocally(rowId, { status: 'pending_review', locked: false, error_message: '' });
      }),
    };
  }
  ```

- [ ] **Step 2: Wire hook into App.jsx and verify mock data loads**

  ```jsx
  import { useEmailQueue } from './hooks/useEmailQueue'

  export default function App() {
    const { rows, loading } = useEmailQueue()
    return (
      <div style={{ color: 'white', padding: '2rem' }}>
        {loading ? 'Loading...' : `${rows.length} emails`}
      </div>
    )
  }
  ```
  Open `http://localhost:5173` — expect "6 emails".

- [ ] **Step 3: Commit**

  ```bash
  git add src/hooks/useEmailQueue.js src/App.jsx && git commit -m "feat(ui): add useEmailQueue hook with mock data"
  ```

---

## Phase 6 — UI Components

### Task 12: StatusBadge + Layout Shell

**Files:** `src/components/ui/StatusBadge.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/layout/TopBar.jsx`, `src/App.jsx`

- [ ] **Step 1: Create `src/components/ui/StatusBadge.jsx`**

  ```jsx
  const statusMeta = {
    pending_review:  { label: 'Pending',      bg: 'bg-amber-500/20',  text: 'text-amber-400'  },
    draft_ready:     { label: 'Draft Ready',  bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
    sending:         { label: 'Sending...',   bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
    sent:            { label: 'Sent',         bg: 'bg-green-500/20',  text: 'text-green-400'  },
    failed:          { label: 'Failed',       bg: 'bg-red-500/20',    text: 'text-red-400'    },
    no_reply_needed: { label: 'No Reply',     bg: 'bg-slate-500/20',  text: 'text-slate-400'  },
    archived:        { label: 'Archived',     bg: 'bg-gray-500/20',   text: 'text-gray-400'   },
  };

  export function StatusBadge({ status }) {
    const m = statusMeta[status] || { label: status, bg: 'bg-gray-500/20', text: 'text-gray-400' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${m.bg} ${m.text}`}>
        {m.label}
      </span>
    );
  }
  ```

- [ ] **Step 2: Create `src/components/layout/Sidebar.jsx`**

  ```jsx
  const tabFilters = {
    inbox:   ['pending_review', 'draft_ready', 'failed'],
    sent:    ['sent'],
    archive: ['archived', 'no_reply_needed'],
  };

  export function Sidebar({ rows, activeTab, onTabChange }) {
    const count = (tab) => rows.filter(r => tabFilters[tab].includes(r.status)).length;
    const tabs = [
      { id: 'inbox', label: 'Inbox' },
      { id: 'sent', label: 'Sent' },
      { id: 'archive', label: 'Archive' },
    ];
    return (
      <aside className="w-56 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>SmartFlow</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Email Dashboard</div>
        </div>
        <nav className="flex-1 p-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${activeTab === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span>{t.label}</span>
              {count(t.id) > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">{count(t.id)}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>
    );
  }
  ```

- [ ] **Step 3: Create `src/components/layout/TopBar.jsx`**

  ```jsx
  export function TopBar({ onRefresh }) {
    return (
      <header className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-base font-semibold text-white">Inbox</h1>
        <button onClick={onRefresh} className="text-xs px-3 py-1.5 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          Refresh
        </button>
      </header>
    );
  }
  ```

- [ ] **Step 4: Update `src/App.jsx` with layout**

  ```jsx
  import { useState } from 'react'
  import { useEmailQueue } from './hooks/useEmailQueue'
  import { Sidebar } from './components/layout/Sidebar'
  import { TopBar } from './components/layout/TopBar'

  export default function App() {
    const [activeTab, setActiveTab] = useState('inbox')
    const [selectedRowId, setSelectedRowId] = useState(null)
    const queue = useEmailQueue()

    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        <Sidebar rows={queue.rows} activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedRowId(null); }} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onRefresh={queue.refresh} />
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 text-slate-400 text-sm">
              {queue.loading ? 'Loading...' : `${queue.rows.length} total rows`}
            </div>
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 5: Verify layout renders with sidebar tabs**

  Open `http://localhost:5173` — expect dark layout with Inbox/Sent/Archive tabs.

- [ ] **Step 6: Commit**

  ```bash
  git add src/ && git commit -m "feat(ui): add StatusBadge, Sidebar, TopBar layout shell"
  ```

---

### Task 13: EmailList Component

**Files:** `src/components/email/EmailList.jsx`, `src/App.jsx`

- [ ] **Step 1: Create `src/components/email/EmailList.jsx`**

  ```jsx
  import { StatusBadge } from '../ui/StatusBadge'

  const tabFilters = {
    inbox:   ['pending_review', 'draft_ready', 'failed'],
    sent:    ['sent'],
    archive: ['archived', 'no_reply_needed'],
  };

  const categoryPills = {
    inquiry:            { label: 'Inquiry',      bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
    appointment:        { label: 'Appointment',  bg: 'bg-violet-500/15', text: 'text-violet-400' },
    rental_application: { label: 'Rental',       bg: 'bg-amber-500/15',  text: 'text-amber-400'  },
    financial_docs:     { label: 'Finance',      bg: 'bg-emerald-500/15',text: 'text-emerald-400'},
    unrelated:          { label: 'Other',        bg: 'bg-slate-500/15',  text: 'text-slate-400'  },
  };

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  export function EmailList({ rows, activeTab, selectedRowId, viewedIds, onSelect }) {
    const filtered = rows.filter(r => tabFilters[activeTab]?.includes(r.status));

    if (filtered.length === 0) {
      return <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>No emails here</div>;
    }

    return (
      <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
        {filtered.map(row => {
          const isSelected = String(row.id) === String(selectedRowId);
          const isUnviewed = row.status === 'pending_review' && !viewedIds.has(String(row.id));
          const cat = categoryPills[row.email_category] || categoryPills.unrelated;
          return (
            <button
              key={row.id}
              onClick={() => onSelect(row.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${isSelected ? 'bg-white/10' : isUnviewed ? 'bg-pink-500/5 hover:bg-white/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium truncate ${isUnviewed ? 'text-white' : 'text-slate-300'}`}>
                  {row.email_from_name || row.email_from}
                </span>
                <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                  {timeAgo(row.received_at)}
                </span>
              </div>
              <div className="text-xs truncate mb-2" style={{ color: 'var(--muted)' }}>
                {row.email_subject}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${cat.bg} ${cat.text}`}>{cat.label}</span>
                <StatusBadge status={row.status} />
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 2: Wire EmailList into App.jsx**

  Add `viewedIds` state and EmailList to the main panel:
  ```jsx
  import { useState, useRef } from 'react'
  import { EmailList } from './components/email/EmailList'

  // Inside App:
  const [viewedIds] = useState(() => new Set())
  const handleSelect = (id) => {
    viewedIds.add(String(id))
    setSelectedRowId(id)
  }
  // Replace the placeholder div with:
  // <EmailList rows={queue.rows} activeTab={activeTab} selectedRowId={selectedRowId} viewedIds={viewedIds} onSelect={handleSelect} />
  ```

- [ ] **Step 3: Verify list renders with all 6 mock rows across tabs**

  - Inbox tab: rows 1, 2, 3, 6 visible (pending_review, draft_ready, failed)
  - Sent tab: row 4
  - Archive tab: row 5

- [ ] **Step 4: Commit**

  ```bash
  git add src/ && git commit -m "feat(ui): add EmailList with category pills and unviewed highlight"
  ```

---

### Task 14: EmailDetail + ActionButtons

**Files:** `src/components/detail/EmailDetail.jsx`, `src/components/detail/ActionButtons.jsx`, `src/App.jsx`

- [ ] **Step 1: Create `src/components/detail/ActionButtons.jsx`**

  ```jsx
  import { useEffect, useRef, useState } from 'react'

  export function ActionButtons({ row, onGenerate, onSend, onNoReply, onArchive, onUnlock }) {
    const generatingRef = useRef(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Auto-trigger draft generation on mount for pending_review with no draft
    useEffect(() => {
      if (row.status === 'pending_review' && !row.draft_text && !generatingRef.current) {
        generatingRef.current = row.id
        setActionLoading(true)
        onGenerate(row.id).finally(() => {
          generatingRef.current = null
          setActionLoading(false)
        })
      }
    }, [row.id]) // eslint-disable-line react-hooks/exhaustive-deps

    const isLocked = row.locked === true || row.locked === 'true' || row.status === 'sending'
    const disabled = isLocked || actionLoading

    const btn = (label, onClick, variant = 'default') => {
      const styles = {
        primary: 'bg-cyan-500 hover:bg-cyan-400 text-black',
        danger:  'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
        default: 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10',
      }
      return (
        <button
          key={label}
          onClick={onClick}
          disabled={disabled}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
        >
          {label}
        </button>
      )
    }

    if (row.status === 'archived') return null
    if (row.status === 'sending') return <div className="text-xs text-indigo-400">Sending email...</div>

    return (
      <div className="flex flex-wrap gap-2">
        {row.status === 'pending_review' && (
          <>
            {btn(actionLoading ? 'Generating...' : 'Generate Draft', () => {
              setActionLoading(true)
              onGenerate(row.id).finally(() => setActionLoading(false))
            }, 'default')}
            {btn('Mark No-Reply', () => onNoReply(row.id), 'danger')}
          </>
        )}
        {row.status === 'draft_ready' && (
          <>
            {btn('Approve & Send', () => onSend(row.id), 'primary')}
            {btn('Regenerate Draft', () => {
              setActionLoading(true)
              onGenerate(row.id).finally(() => setActionLoading(false))
            })}
            {btn('Mark No-Reply', () => onNoReply(row.id), 'danger')}
          </>
        )}
        {row.status === 'failed' && (
          <>
            {btn('Retry Draft', () => {
              setActionLoading(true)
              onGenerate(row.id).finally(() => setActionLoading(false))
            })}
            {btn('Mark No-Reply', () => onNoReply(row.id), 'danger')}
          </>
        )}
        {(row.status === 'sent' || row.status === 'no_reply_needed') && (
          btn('Archive', () => onArchive(row.id))
        )}
      </div>
    )
  }
  ```

- [ ] **Step 2: Create `src/components/detail/EmailDetail.jsx`**

  ```jsx
  import { useState } from 'react'
  import { StatusBadge } from '../ui/StatusBadge'
  import { ActionButtons } from './ActionButtons'

  export function EmailDetail({ row, queue }) {
    const [draftText, setDraftText] = useState(row.draft_text || '')

    // Sync draftText when row changes (new row selected or draft updated)
    if (draftText !== (row.draft_text || '') && !queue.rows.find(r => String(r.id) === String(row.id))?.locked) {
      setDraftText(row.draft_text || '')
    }

    const isGenerating = (row.locked === true || row.locked === 'true') && row.status === 'pending_review'

    return (
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">{row.email_subject}</h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                From: <span className="text-slate-300">{row.email_from_name || row.email_from}</span>
                {row.email_from_name && <span> &lt;{row.email_from}&gt;</span>}
              </p>
              {row.customer_phone && (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Phone: <span className="text-slate-300">{row.customer_phone}</span></p>
              )}
            </div>
            <StatusBadge status={row.status} />
          </div>
        </div>

        {/* Original message */}
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Original Message</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{row.email_body_full}</p>
        </div>

        {/* AI Summary */}
        {row.email_summary && (
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'rgba(34,211,238,0.03)' }}>
            <p className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: 'var(--accent)' }}>AI Summary</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{row.email_summary}</p>
          </div>
        )}

        {/* Draft */}
        {(row.status === 'draft_ready' || row.status === 'pending_review' || row.status === 'failed') && (
          <div className="px-6 py-4 border-b flex-1" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>AI Draft Reply</p>
            {isGenerating ? (
              <div className="h-32 rounded-lg flex items-center justify-center text-sm" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>
                Generating draft...
              </div>
            ) : (
              <textarea
                className="w-full min-h-32 rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                placeholder="Draft will appear here once generated..."
              />
            )}
          </div>
        )}

        {/* Error */}
        {row.status === 'failed' && row.error_message && (
          <div className="px-6 py-2">
            <p className="text-xs text-red-400">Error: {row.error_message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 flex-shrink-0">
          <ActionButtons
            row={row}
            onGenerate={(id) => queue.generateDraft(id)}
            onSend={(id) => queue.sendReply(id, draftText)}
            onNoReply={(id) => queue.markNoReply(id)}
            onArchive={(id) => queue.archive(id)}
            onUnlock={(id) => queue.unlock(id)}
          />
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 3: Wire EmailDetail into App.jsx**

  ```jsx
  import { EmailDetail } from './components/detail/EmailDetail'

  // In the layout, split the main content area:
  // Left: EmailList (w-80 flex-shrink-0)
  // Right: EmailDetail (flex-1) — only shown when selectedRowId is set
  const selectedRow = queue.rows.find(r => String(r.id) === String(selectedRowId))
  ```

  Full `App.jsx`:
  ```jsx
  import { useState } from 'react'
  import { useEmailQueue } from './hooks/useEmailQueue'
  import { Sidebar } from './components/layout/Sidebar'
  import { TopBar } from './components/layout/TopBar'
  import { EmailList } from './components/email/EmailList'
  import { EmailDetail } from './components/detail/EmailDetail'

  export default function App() {
    const [activeTab, setActiveTab] = useState('inbox')
    const [selectedRowId, setSelectedRowId] = useState(null)
    const [viewedIds] = useState(() => new Set())
    const queue = useEmailQueue()

    const selectedRow = queue.rows.find(r => String(r.id) === String(selectedRowId))

    const handleSelect = (id) => {
      viewedIds.add(String(id))
      setSelectedRowId(id)
    }

    return (
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        <Sidebar
          rows={queue.rows}
          activeTab={activeTab}
          onTabChange={(t) => { setActiveTab(t); setSelectedRowId(null) }}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onRefresh={queue.refresh} />
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 flex-shrink-0 border-r overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              <EmailList
                rows={queue.rows}
                activeTab={activeTab}
                selectedRowId={selectedRowId}
                viewedIds={viewedIds}
                onSelect={handleSelect}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedRow
                ? <EmailDetail row={selectedRow} queue={queue} />
                : <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--muted)' }}>Select an email to review</div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 4: Test all actions with mock data**

  - Click row 1 (pending_review) → draft auto-generates (mock) → textarea fills
  - Click "Approve & Send" on row 2 (draft_ready) → status changes to sent
  - Click "Mark No-Reply" → row moves to archive tab
  - Switch to Sent tab → row 4 visible
  - Switch to Archive tab → row 5 visible

- [ ] **Step 5: Commit**

  ```bash
  git add src/ && git commit -m "feat(ui): add EmailDetail and ActionButtons with full status-aware logic"
  ```

---

## Phase 7 — Live API Integration

### Task 15: Switch to Live API and End-to-End Test

**Files:** `.env.local`

- [ ] **Step 1: Enable live API**

  Update `.env.local`:
  ```
  VITE_N8N_URL=https://n8n.srv823907.hstgr.cloud
  VITE_USE_LIVE_API=true
  ```
  Restart dev server: `npm run dev`

- [ ] **Step 2: Verify existing queue rows load**

  The test rows inserted during n8n testing should appear in the dashboard. If queue is empty, send a test email to the Property Agent Demo Gmail.

- [ ] **Step 3: Full end-to-end test flow**

  - [ ] Send a buyer enquiry email to Property Agent Demo Gmail
  - [ ] Wait ~1-2 min for WF1 to trigger
  - [ ] Refresh dashboard → new `pending_review` row appears
  - [ ] Click the row → auto-generates AI draft (may take 10-20s)
  - [ ] Draft appears in textarea — edit if desired
  - [ ] Click "Approve & Send"
  - [ ] Row moves to Sent tab
  - [ ] Open Gmail → verify reply arrived in the original thread

- [ ] **Step 4: Test WFB**

  - Send another test email → appears as pending_review
  - Click "Mark No-Reply" → row moves to Archive tab

- [ ] **Step 5: Test WFD**

  - Archive a sent row → row moves to Archive tab with status "archived"

- [ ] **Step 6: Commit**

  ```bash
  git add .env.example && git commit -m "feat: complete live API integration and end-to-end test"
  ```

---

## Phase 8 — Deploy to Vercel

### Task 16: Deploy + Configure CORS

- [ ] **Step 1: Push to GitHub**

  Create a GitHub repo `realestate-demo2` (private), then:
  ```bash
  git remote add origin https://github.com/<your-org>/realestate-demo2.git
  git push -u origin main
  ```

- [ ] **Step 2: Create Vercel project**

  - Go to vercel.com → New Project → Import from GitHub → `realestate-demo2`
  - Framework: Vite
  - Add environment variable: `VITE_N8N_URL` = `https://n8n.srv823907.hstgr.cloud`
  - Add: `VITE_USE_LIVE_API` = `true`
  - Deploy

- [ ] **Step 3: Note the Vercel URL**

  e.g. `https://realestate-demo2.vercel.app`

- [ ] **Step 4: Configure n8n CORS on VPS**

  SSH into VPS:
  ```bash
  ssh root@<vps-ip>
  nano /root/docker-compose.yml  # or wherever the file is
  ```

  Add to the n8n service environment:
  ```yaml
  - N8N_CORS_ALLOWED_ORIGINS=https://realestate-demo2.vercel.app
  ```

  Restart n8n:
  ```bash
  docker compose restart n8n
  ```

- [ ] **Step 5: Test production deployment**

  Open `https://realestate-demo2.vercel.app` → send test email → verify full flow works.

- [ ] **Step 6: Final commit + update memory**

  Update `/Users/ambrosevoon/Projects/realestate-demo2/memory.md`:
  ```
  Status: COMPLETE
  Dashboard URL: https://realestate-demo2.vercel.app
  n8n workflows: all 8 [REALESTATE DEMO] workflows active
  ```

  ```bash
  git add memory.md tasks.md && git commit -m "docs: update memory with deployment details"
  git push
  ```

---

## Critical Rules Cheatsheet

| Rule | Trigger |
|------|---------|
| DataTable UPDATE is fully destructive → always send complete row | Every UPDATE in WFA/WFC/WFB/WFD/WFE |
| Filter UPDATE by `gmail_message_id` not `id` | Every UPDATE |
| Gmail typeVersion 2.1 for expression messageId | WFC send/label/read nodes |
| IF typeVersion 2.2, singleValue: true, combinator: "and" | Every IF node |
| No Merge after IF — two independent terminal paths | Every IF node |
| continueOnFail: true on AI node AND mirror node | WFA, WF1 |
| Both WFA paths release the lock | WFA Build Update Payload |
| responseCode must be integer | Every respondToWebhook |
| webhookId UUID required per webhook node | Every webhook node |
| Restart Docker after creating workflows via API | After each phase |
| Empty draft rejected at both frontend and backend | WFC validate + ActionButtons |
