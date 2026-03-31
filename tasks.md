# tasks.md — OpenHome AI Demo v2

## Phase 0 — Setup
- [x] Initialise repo and create CLAUDE.md, memory.md, tasks.md (2026-03-25)

## Phase 1 — n8n Workflow Backend
- [x] Task 1: Create [REALESTATE DEMO] Reply Queue Data Table (SNuUAGKhh9vTHWlR) (2026-03-25)
- [x] Task 2: Build WFE – Unlock & Reset (RwrAYJx0XvSLPLA9, POST /re-unlock) (2026-03-25)
- [x] Task 3: Build WF2G – Get Row (Qh1KnGk5BKDMgr3I, GET /re-row) (2026-03-25)
- [x] Task 4: Build WF2H – List Queue (Zg7u1KbICAbc1NFb, GET /re-list) (2026-03-25)
- [x] Task 5: Build WFA – Generate Draft (gH9tI9I1U4ie2zHC, POST /re-generate-draft) (2026-03-25)
- [x] Task 6: Build WFC – Approve & Send (IqidW8hrIY2vaPFP, POST /re-send) (2026-03-25)
- [x] Task 7: Build WFB + WFD – Utility Workflows (ry88tCTs3oKjjhAL / KobSqJ9sbWOCEX3o) (2026-03-25)
- [x] Task 8: Build WF1 – Email Intake (DYmTKLtNP11h7kEH, polls every minute) (2026-03-25)
- [x] Task 8b: Rebuild WF1 — Schedule Trigger + batch Gmail fetch + deduplication (every 2 min, all unread at once) (2026-03-31)

## Phase 2 — React Frontend
- [x] Task 9: Scaffold React/Vite project (2026-03-25)
- [x] Task 10: API layer + mock data (2026-03-25)
- [x] Task 11: useEmailQueue hook (2026-03-25)
- [x] Task 12: StatusBadge + layout shell (Sidebar, TopBar, App.jsx) (2026-03-25)
- [x] Task 13: EmailList component (2026-03-25)
- [x] Task 14: EmailDetail + ActionButtons (2026-03-25)
- [x] Task 15: Live API integration + E2E test (2026-03-25)

## Phase 3 — Deploy
- [x] Task 16: Deploy to Vercel — https://realestate-demo2.vercel.app (2026-03-25)

## Phase 4 — Fixes & Redesign (Session 2 — 2026-03-30)
- [x] Fix: VITE_USE_LIVE_API env var had trailing \n — dashboard was always showing mock data (2026-03-30)
- [x] Fix: WF1 Format Data node used .first() instead of .item — only 1 email saved per batch (2026-03-30)
- [x] Rebrand: page title updated from "emaildash" to "SmartFlow | Email Dashboard" (2026-03-30)
- [ ] Task 17: Install framer-motion, gsap, @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge
- [ ] Task 18: Set up @/ path alias + cn utility
- [ ] Task 19: Create ui/button.jsx + ui/AnimatedGroup.jsx
- [ ] Task 20: Redesign theme — warm gradient palette (purple accent, 21st.dev style)
- [ ] Task 21: Apply GSAP gradient animation to Sidebar
- [ ] Task 22: Add framer-motion blur-fade animations to EmailList items
- [x] Task 23: Document all n8n workflows in docs/n8n-workflows.md (2026-03-31)
