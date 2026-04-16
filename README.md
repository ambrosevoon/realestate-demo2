# OpenHome AI — Real Estate Enquiry Reply System

A human-in-the-loop AI assistant that helps real estate agents triage incoming buyer enquiries and send polished, contextual replies without writing a single word from scratch. The agent provides brief owner instructions — a price guide, availability notes, or tone preference — and the system generates a fully drafted reply ready for one-click approval and sending.

**Live demo:** https://realestate-demo2.vercel.app/

## Purpose

Real estate agents receive a constant stream of email enquiries from buyers: requests for price guides, inspection bookings, finance questions, and general interest in listed properties. Responding promptly and professionally to each one is critical — buyer intent fades quickly, and the first agent to reply typically earns the relationship.

The problem is that agents spend significant time crafting replies that are largely repetitive in structure but need to feel personal and accurate. OpenHome AI removes the writing step entirely. The agent stays in control of what gets sent, but the cognitive load of composing each reply is offloaded to the system.

## How It Works

### Email Ingestion

Incoming buyer enquiries arrive in a connected Gmail inbox and are pulled into the system automatically on a recurring schedule via an n8n workflow. Each email is parsed, categorised (enquiry, inspection request, price query, etc.), assessed for urgency, and written as a new row in the reply queue stored in Supabase.

### AI Draft Generation

When a new email lands in the Inbox tab with a status of Pending Review, the system immediately triggers draft generation in the background. The LLM receives the full email content, any owner instructions provided by the agent, and context about the property and agency. It returns a subject line and complete reply body.

If generation fails for any reason, the row enters a Failed state and can be retried. The system uses a row-level locking mechanism to prevent duplicate generation runs for the same email.

### Human Review and Approval

The interface presents incoming emails in a two-pane layout. The left pane lists the queue, filterable by tab (Inbox, Sent, Archive). The right pane shows the full original email alongside the AI-generated draft in an editable text area.

The agent can:

* Read the original message in full
* Review and edit the AI draft directly in the interface
* Add or modify owner instructions and regenerate with one click
* Approve and send the reply via the Gmail API
* Mark the message as no reply needed
* Archive processed threads

No email is ever sent without the agent explicitly clicking Approve and Send.

### Sending

Approved replies are dispatched through an n8n workflow connected to the agent's Gmail account. The system marks the row as Sent and moves it to the Sent tab. The original thread in Gmail receives the reply attached to the correct message chain.

### Status Lifecycle

```
Pending Review  →  Draft Ready  →  Sending  →  Sent  →  Archived
                              ↘  No Reply Needed  →  Archived
                              ↘  Failed  →  (retry)
```

## Architecture

```
Gmail Inbox (buyer enquiries)
    │
    └── n8n Schedule Trigger (every 2 minutes)
          ├── Gmail: fetch unread messages (batch of 5)
          ├── AI Categoriser: classify urgency and category
          └── Supabase: write to reply queue
                │
                └── Browser (Vite + React)
                      ├── Inbox tab: pending_review, draft_ready, failed
                      ├── Sent tab: sent, sent_test
                      └── Archive tab: archived, no_reply_needed
                            │
                            └── n8n Webhooks (triggered on agent action)
                                  ├── /re-generate-draft  — LLM reply generation
                                  ├── /re-send            — approve and send via Gmail
                                  ├── /re-no-reply        — mark as no action needed
                                  ├── /re-archive         — archive processed thread
                                  └── /re-unlock          — release stuck locks
```

The Supabase reply queue acts as the shared state layer between the n8n ingestion workflows and the browser interface. All reads and writes from the browser go directly to Supabase. All external operations (Gmail, LLM) are triggered through n8n webhooks.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), JSX, Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Automation | n8n (self-hosted on Hostinger VPS) |
| AI / LLM | OpenRouter — Claude via n8n workflow |
| Email | Gmail API via n8n |
| Deployment | Vercel |

## Key Features

* **Automated ingestion** — incoming Gmail enquiries pulled and queued on a 2-minute schedule
* **Instant draft generation** — LLM reply triggered automatically when an email enters Pending Review
* **Owner instructions** — agent provides context (price guide, availability, tone) that shapes the draft
* **Editable drafts** — full subject and body editing in the browser before any email is sent
* **One-click regeneration** — refresh the draft with updated instructions at any time
* **Approval gate** — no email leaves without explicit agent action
* **Row-level locking** — prevents duplicate send or generation operations on the same thread
* **Three-tab queue** — Inbox, Sent, and Archive views with live counts
* **Resizable pane layout** — drag the divider between the email list and detail view
* **Mobile responsive** — single-column layout with back navigation on smaller screens
* **Light and dark mode** — system-aware theme with a manual toggle

## Design Philosophy

The interface is intentionally minimal. The agent's attention should be on the email content and the draft, not on the tool itself. The two-pane layout mirrors the reading experience of an email client, reducing cognitive switching. Status badges provide immediate visual context without requiring the agent to read pipeline labels. The system is designed to be fast to scan and faster to action.