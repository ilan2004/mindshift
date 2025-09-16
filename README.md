# 🚀 Nudge: Personality-Aware Productivity

> Personality-aware focus system across web + Chrome extension with adaptive nudges, contracts, and a social dashboard.
>
> Originally built during Recurzive v2 (24h Hackathon, Dayananda Sagar College, Bengaluru) — now with a working Next.js app, FastAPI backend, Supabase schema, and a Chrome MV3 extension.

---

## 🏁 Quick Start

Prereqs
- Node.js 18+ (recommended: Node 20)
- Python 3.10/3.11
- Google Chrome (for the extension)
- Optional: a Supabase project

1) Backend (FastAPI)
- Windows PowerShell

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
# Optional CORS tuning
$env:ALLOWED_ORIGINS = "http://localhost:3000, http://127.0.0.1:3000"
# Start API (from ./backend)
cd backend
uvicorn app.main:app --reload --port 8000
```

- macOS/Linux

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
# Optional CORS tuning
export ALLOWED_ORIGINS="http://localhost:3000, http://127.0.0.1:3000"
cd backend
uvicorn app.main:app --reload --port 8000
```

2) Frontend (Next.js)

```powershell
npm install
# Create .env.local in repo root with at least:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev
```

3) Chrome Extension (MV3)
- Open chrome://extensions
- Enable Developer mode
- Load unpacked → select the extension/ folder
- The extension injects into http://localhost:3000/* and https://nudges.vercel.app/*

See SUPABASE_SETUP.md to wire Supabase auth and DB.

---

## 🔧 Environment Variables

Frontend (.env.local at repo root)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# Optional if using Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Backend (process env)
- CORS
  - ALLOWED_ORIGINS: comma/space-separated list (defaults include localhost)
  - ALLOWED_ORIGIN_REGEX: optional regex for preview domains (default allows *.starshape.in)
- Supabase-backed blocklist (optional)
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE

---

## ▶️ How to Run (Dev)

- Start backend: uvicorn app.main:app --reload --port 8000 (from backend/)
- Start frontend: npm run dev (port 3000)
- Load the extension: chrome://extensions → Load unpacked → extension/
- Visit http://localhost:3000 and use the UI to start a focus session, take the test, and explore the dashboard/leaderboard.

Useful docs
- SUPABASE_SETUP.md — end-to-end auth + schema setup
- docs/api_contract.md — REST contract (initial)
- docs/Project_Overview.md — detailed product/architecture write-up
- WARP.md — dev commands and architecture notes

---

## 🧰 Tech Stack (current)

Frontend
- Next.js 15 (App Router), React 19
- TailwindCSS 4, Framer Motion, GSAP, SplitType
- Supabase JS client (optional)

Backend
- FastAPI, Uvicorn
- httpx, Pydantic, OpenAI SDK (for planned LLM question generation)

Database
- Supabase (PostgreSQL)
- Schema: database/schema.sql

Extension
- Chrome Manifest v3 (background + content + static overlay)

---

## 📡 API Overview

Base (dev): http://localhost:8000

Core
- GET /healthz → { status: "ok" }
- GET /debug/cors → show CORS config

Questions & Profiling
- POST /history/ → { user_id, history }
- GET /questions/ → optional ?user_id=, ?themes=
- POST /questions/ → { user_id, themes, mbti_hint }
- POST /answers/ → { user_id, answers }
- POST /events/ → { user_id, event_type, details }

Blocklist (per-user token)
- GET /blocklist/{token}.txt → newline domain list
- GET /blocklist/{token}.filter → Adblock-style rules
- GET /blocklist/{token}.json → { base, custom, count }
- POST /blocklist/{token} → add domains: { domain: string } or { domains: [string] }
- DELETE /blocklist/{token} → remove domain: { domain }

Full request/response examples: docs/api_contract.md

---

## 🧩 Chrome Extension

- Permissions: storage, alarms, declarativeNetRequest, tabs
- Injects into localhost:3000 and production site; redirects blocked domains to extension/blocked.html
- Background: manages focus/break timers, dynamic rules, temporary allow, and profile
- Content script: message bridge and event listeners from the web app

Typical flow
1) Start a focus session in the web app → background creates DNR rules
2) Navigate to a blocked site → redirected to a friendly overlay with a timer and nudges
3) Use “Emergency Pass” or quick quiz to unlock a short window if needed

---

## 🐳 Docker (Backend only)

Build & run
```bash
docker build -t nudge-api -f Dockerfile .
docker run --rm -p 8080:8080 -e ALLOWED_ORIGINS="http://localhost:3000" nudge-api
```
The container exposes FastAPI on port 8080.

---

## 📂 Project Structure (updated)

- src/
  - app/ — Next.js routes (dashboard, leaderboard, profile, stake, about, game, etc.)
  - components/ — UI components (GSAP animations, overlays, leaderboard, etc.)
  - lib/ — backend client, Supabase client, assets, focus store, themes
  - styles/, contexts/, hooks/, utils/
- backend/
  - app/ — FastAPI app (main.py, routers, services)
  - requirements.txt
- extension/ — Chrome MV3 (manifest.json, background.js, content.js, blocked.html/js, popup.html)
- database/ — schema.sql (Supabase/Postgres)
- docs/ — api_contract.md, Project_Overview.md, plus integration docs
- Dockerfile — backend container
- package.json — Next.js app scripts

---

## ⚙️ Features (MVP)
- ChatGPT History Import → upload/exported text, generate custom assessment
- Personalized Personality Test → ~10–15 contextual questions
- Focus Blocking System → extension timer + overlay on distraction sites
- Commitment Contracts (optional) → money, peer accountability, streaks
- Leaderboard → social motivation
- Dashboard → profile card, contracts status, streak tracking

---

## 🔗 Integration Rules
- Frontend ↔ Backend via src/lib/backend.js (no direct fetches from components)
- Supabase as the source of truth once configured (profiles, sessions, contracts, leaderboard)
- Shared contracts in docs/api_contract.md

---

## 👥 Team Roles (hackathon snapshot)
- Ilan → Next.js + Supabase boilerplate, Chrome extension, prompts, Git setup
- Hadee → FastAPI backend, history parsing, test generation, profile assignment logic
- Rohan → Leaderboard UI + integrations
- TBD → Contracts logic + Dashboard polish

---

## 🎤 Judge Demo Flow
1. Upload ChatGPT history → see personalized questions generated
2. Answer questions → system assigns personality profile
3. Open a distraction site → blocker overlay with profile-based nudge
4. Set a contract (e.g., Peer Contract) → simulate failure → peer gets reward
5. Show Leaderboard and Dashboard with points/streaks
6. Close with the vision: deeper contracts and adaptive AI coach

---

## 🚀 Vision Beyond Hackathon
- Real-time integration with Instagram/TikTok/YouTube feeds
- Adaptive nudges that evolve with your profile
- More contract types (charity loss, mentor mode, randomized consequences)
- Community features (peer groups, challenges, shared streaks)

---

## 🧭 Notes
- Next.js PWA config (next-pwa) is disabled in dev and enabled for production builds
- If Supabase isn’t configured, local mocks are used in parts of the UI (see src/lib/api.js)
- For backend CORS, see /debug/cors
