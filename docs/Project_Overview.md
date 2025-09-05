# MindShift – Personality-Aware Productivity Platform

## 1) Executive Summary
MindShift combats digital distraction by combining AI-driven personality profiling with commitment mechanisms and an attention-aware experience across web and a browser extension. Instead of generic blockers, MindShift analyzes a user’s prior chat patterns to generate a personalized assessment, assigns a profile, and then adapts nudges, focus timers, and contracts to the user’s actual behavior. A dashboard and leaderboard turn productivity into a social and gamified habit.

- __Core proposition__: Personalized, adaptive focus system that aligns interventions to individual psychology.
- __Primary users__: Students, indie builders, knowledge workers who want to reduce distraction and sustain deep work.
- __MVP surface__: Next.js web app + Chrome extension + FastAPI backend + Supabase schema.

---

## 2) Problem Statement
- __Attention engineering__: Social platforms optimize for engagement; conventional blockers are blunt and easy to bypass.
- __One-size-fits-all__: Timers and generic questionnaires ignore personal context and motivational styles.
- __Low accountability__: Without stakes (social, monetary, streaks), adherence decays.

__Therefore__: Users need an intervention system that adapts to their psychology, integrates into their browsing flow, and adds meaningful incentives to follow-through.

---

## 3) Solution Overview
MindShift delivers a personality-aware productivity loop:
1. __Import History__ – User provides ChatGPT conversation history (or seeded messages) to bootstrap a context-rich assessment.
2. __Generate Questions__ – Backend turns history into 10–15 tailored questions (scale or free-form) that probe habits and values.
3. __Assign Profile__ – Answers map to an archetype (e.g., Achiever, Explorer, Diplomat, Analyst) and trait scores.
4. __Adaptive Nudges__ – Chrome extension overlays site-specific blockers and nudges aligned with the user’s profile.
5. __Commitment Contracts__ – Monetary, peer-based, or streak-based consequences to increase adherence.
6. __Track + Compete__ – Dashboard visualizes focus stats; leaderboard introduces social motivation.

---

## 4) Methodology and Data Flow
- __Inputs__
  - Chat history upload or seeded interactions
  - User answers to generated questions
  - Extension events: start_focus, end_focus, distraction events, etc.
- __Processing__
  - Question generation (LLM) based on topics, sentiment, and behavioral cues in history
  - Profiling algorithm assigns a type and traits from answers
  - Event stream updates streaks, points, recommendations
- __Outputs__
  - Profile + traits
  - Recommendations and profile-matched nudges
  - Focus metrics, streaks, leaderboard placement

__Request/Response Path__
- Frontend (Next.js) calls FastAPI via `src/lib/backend` wrapper (see `src/app/dashboard/page.js` test panel)
- FastAPI computes/generates outputs and persists via Supabase tables (`database/schema.sql`)
- Chrome extension consults Supabase (or backend) for active sessions, blocked domains, contract state

---

## 5) Key User Journeys
- __Onboarding__
  - Greeting + intro overlay (animated via GSAP-based components)
  - Upload history → get personalized questions → complete test → see final reveal and assigned profile
- __Daily Focus__
  - Start a focus session (Pomodoro or custom duration)
  - Extension intercepts distraction attempts with profile-tuned nudges
  - Events (start/end/distraction) update streaks and points
- __Commitment__
  - Create a stake (money/peer/streak) in the app (stored locally for MVP via `src/lib/api.js`, later Supabase)
  - Contract status updates (active/succeeded/failed)
- __Social__
  - View leaderboard and peers
  - Participate in community challenges (UI stubs in `src/components/`)

---

## 6) Architecture Overview
- __Frontend__: Next.js (App Router) with React 19, TailwindCSS 4, GSAP animations
  - Components: dashboard, leaderboard, contracts UI, focus widgets, animated loader and text reveal (`src/components/Loader.jsx`, `TextReveal.jsx`, `ClientLayout.jsx`)
  - Page examples: `src/app/dashboard/page.js`, `src/app/leaderboard/`
- __Backend__: FastAPI (mock endpoints now; LLM integration planned)
  - Endpoints documented in `docs/api_contract.md`
  - Packages: FastAPI, Uvicorn, Pydantic, OpenAI SDK, httpx
- __Database__: Supabase (PostgreSQL)
  - Schema in `database/schema.sql` for users, questions/answers, contracts, leaderboard, focus_sessions, blocked_domains, and extended tables (chat_history, generated_questions, traits, events, recommendations)
- __Extension__: Chrome MV3
  - Intercepts target domains, applies overlays, syncs with backend/Supabase for timer and contracts

---

## 7) Tech Stack
- __Web__: Next.js 15, React 19, TailwindCSS 4, Framer Motion, GSAP (`gsap`, `@gsap/react`), SplitType; view transitions
- __State/Clients__: Simple local state; planned Supabase client (`@supabase/supabase-js`)
- __Backend__: FastAPI, OpenAI (planned question generation), httpx
- __Data__: Supabase/PostgreSQL
- __Extension__: Chrome MV3 (background/content scripts + injected overlays)

See `package.json` for versions and `backend/requirements.txt` for Python deps.

---

## 8) Frontend Experience Details
- __Animations__
  - Preloader and greeting transitions adapted from Terrene, ported with GSAP and SplitType
  - Text reveal lines via `src/components/TextReveal.jsx` and `src/app/preloader.css`
- __Client Layout Flow__ (`src/components/ClientLayout.jsx`)
  - Stages: greeting → introForm → testRunner → finalReveal → app
  - Scroll locking during overlays; safe auto-advance to prevent dead-ends
- __Dashboard__ (`src/app/dashboard/page.js`)
  - Cards for productivity graph, leaderboard, peer status, contract feed
  - Built-in backend test panel that calls `postHistory`, `getQuestions`, `postAnswers`, `postEvent`

---

## 9) Backend API (current contract)
See `docs/api_contract.md` for request/response examples.
- `GET /api/health` → health check
- `POST /api/questions/generate` → `{ history_text }` → list of tailored questions
- `POST /api/profile/assign` → `{ answers }` → profile `{ type, score }`
- Upcoming: `/history`, `/answers`, `/events`, `/leaderboard` to support the dashboard test panel

FastAPI quick start in `backend/README.md`.

---

## 10) Data Model (Supabase schema)
Defined in `database/schema.sql`.
- __Core__: `users`, `questions`, `answers`, `contracts`, `leaderboard`
- __Focus__: `focus_sessions` (mode, status, ends_at, remaining_ms)
- __Blocking__: `blocked_domains` (unique per user)
- __LLM Pipeline__: `chat_history`, `generated_questions`, `user_answers`
- __Insights__: `traits`, `events`, `recommendations`

Indexes provided for common query paths (by user_id, type, created_at).

---

## 11) Chrome Extension Behavior
- __Blocking__: On navigating to a distraction domain (from `blocked_domains`), overlay intercepts with a profile-tuned nudge
- __Timers__: Session state can be read/written to Supabase or backend; extension respects contract rules (e.g., streak resets on failure)
- __Communication__: Background script + content script; extension can fetch leaderboard data or push events

---

## 12) Goals and Impact
- __Goals__
  - Measure and reduce daily distraction time by 20–40%
  - Increase weekly deep-work hours and maintain streaks ≥ 7 days
  - Improve self-efficacy via tailored nudges and visible progress
- __Impact Metrics__
  - Focus hours and streak length
  - Distraction deflections per day and time-on-task
  - Contract adherence rate (success/failure)
  - Social metrics: leaderboard rank changes, peer challenge participation

---

## 13) Security, Privacy, and Ethics (MVP posture)
- __Data Minimization__: Only collect data needed for question generation and focus telemetry
- __User Control__: Clear upload UI; user can remove history and answers (delete path to be added)
- __API Keys__: OpenAI key is never hardcoded; .env files for local dev, server-side only usage
- __PII__: Use pseudonymous `user_id`; add Supabase Auth later for managed identities
- __Extension__: Avoid invasive permissions; explicit domain list with user control

---

## 14) Limitations (Current MVP)
- Question generation and profiling algorithms are early-stage; may require tuning and guardrails
- Leaderboard and stakes use local mocks (`src/lib/api.js`) pending Supabase hookup
- Extension overlay and contract enforcement are minimal; sophisticated detection to be added

---

## 15) Roadmap
- __Short-term__
  - Wire real Supabase client on web, replace local mocks
  - Implement `/history`, `/answers`, `/events`, `/leaderboard` in FastAPI
  - Connect extension to backend for session/contract state
- __Mid-term__
  - Adaptive nudges that evolve with trait shifts
  - Rich contracts (charity loss, mentor mode, randomized consequences)
  - Community features: peer groups, challenges, shared streaks
- __Long-term__
  - Real-time integrations with Instagram/YouTube/TikTok
  - Cross-device focus sessions and mobile companion app

---

## 16) Setup (Dev)
- Web: `npm i` → `npm run dev` (Next.js)
- Backend: `python -m venv .venv && pip install -r backend/requirements.txt && uvicorn app.main:app --reload --port 8000`
- Supabase: Create project → set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`; apply `database/schema.sql`

---

## 17) References
- `README.md` – high-level hackathon plan and demo flow
- `docs/api_contract.md` – REST contracts
- `database/schema.sql` – DB schema and indices
- `src/components/*` – UI components, GSAP preloader, text reveal
- `backend/README.md` – FastAPI setup
