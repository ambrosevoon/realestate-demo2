# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpenHome AI — Demo Site v2**

This is the second iteration of the OpenHome AI real estate enquiry concierge demo. The product is a property listing page with embedded AI chat and voice widgets that capture buyer leads and forward them to the agent's workflow via n8n.

The v1 reference project is at `/Users/ambrosevoon/Projects/realestate-demo` — a static multi-file HTML/CSS/JS site.

## Tech Stack

Plain HTML/CSS/JS (static site, no build step). Served via file:// or any static host. No package manager or bundler.

## File Structure (v1 pattern to follow)

```
index.html          — main listing/marketing page
admin.html          — agent setup UI (optional)
css/main.css        — all styles
js/config.js        — OPENHOUSE_CONFIG global (agency, property, AI settings, FAQs)
js/chat.js          — ChatWidget class
js/voice.js         — VoiceWidget class
js/app.js           — page-level behaviour (nav, scroll, FAQ, pricing)
prompts/            — n8n AI system prompt templates (text-chat.md, voice-agent.md, lead-formatter.md)
data/               — sample payloads and test fixtures
```

## Architecture

### Config-driven design
All agency, property, FAQ, and AI settings live in `js/config.js` as `window.OPENHOUSE_CONFIG`. Every other module reads from this global. To adapt the demo for a new listing, only `config.js` needs to change.

### Dual AI modes
- **Text chat** (`ChatWidget` class in `chat.js`) — inline demo panel + floating widget variant
- **Voice AI** (`VoiceWidget` class in `voice.js`) — Web Speech API (SpeechRecognition + SpeechSynthesis) for MVP; production upgrade path is Vapi/ElevenLabs/Deepgram

Both modes share the same n8n webhook URL, session ID prefix, and lead capture logic.

### Lead capture flow
Both widgets implement a multi-step lead collection sequence: after 2–3 exchanges, naturally prompt for name + phone (required) and email (optional). On capture, POST to n8n webhook with `{ message, sessionId, property }` and receive `{ reply, hasLead }`.

### n8n backend
- **Webhook:** `https://n8n.srv823907.hstgr.cloud/webhook/real-estate-chat`
- **Workflow ID:** `K35bKpcdpjG9Fgzk` ("OpenHome AI – Real Estate Chat Agent")
- **Payload:** `{ message, sessionId, property }`
- **Response:** `{ reply, hasLead }`

All AI prompt templates are in `prompts/` using `{placeholder}` substitution — the n8n workflow injects live config values.

### Design system
Dark glassmorphism — deep navy background (`#080d1a`), violet + cyan accent palette. Font: Inter. All animation via `data-animate` attributes observed by IntersectionObserver in `app.js`.

## Key Rules

- `config.js` is the single source of truth. Never hardcode property or agency data elsewhere.
- The VoiceWidget must handle `file://` protocol gracefully — Chrome has separate permission scopes for `getUserMedia` and `SpeechRecognition` on `file://`, so skip the `getUserMedia` pre-warm in that context.
- Prompts in `prompts/` use Australian English (colour, enquiry, authorised, metre).
- The Google Sheets `spreadsheetId` is intentionally left as `SHEET_ID_PLACEHOLDER` in config — it is set inside the n8n workflow node, not in client-side code.
