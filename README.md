# 🚀 MindShift: Personality-Aware Productivity

> A hackathon project built at Recurzive v2 (24h Hackathon, Dayananda Sagar College, Bengaluru)

---

## 🌟 Problem
Social media & online distractions are optimized for attention, not productivity. Generic blockers and timers fail because they don’t account for **individual psychology**. People need interventions that are **personalized, motivating, and adaptive** to their unique mindset.

---

## 💡 Our Solution
**MindShift** uses AI + personality profiling to create a personalized productivity system that:
1. Analyzes your **ChatGPT history** to generate **personalized personality questions** (instead of generic MBTI-style forms).  
2. Builds a **profile type** (Achiever, Explorer, Diplomat, Analyst, etc.) tailored to your actual behavior.  
3. Applies **profile-driven nudges** when you try to access distraction sites.  
4. Adds **commitment contracts** (financial, peer, streak-based, etc.) to keep you accountable.  
5. Tracks progress in a **dashboard + leaderboard** so you can compete or collaborate with peers.  

---

## ⚙️ Features (MVP)
- **ChatGPT History Import** → upload exported JSON, AI generates custom personality test.  
- **Personalized Personality Test** → 10–15 contextual questions based on your history.  
- **Focus Blocking System** → Chrome extension timer + distraction-site overlay.  
- **Commitment Contracts** (optional) → stake money, peer accountability, or streak resets.  
- **Leaderboard** → compare productivity scores with peers.  
- **Dashboard** → profile card, contracts status, streak tracking.  

---

## 🛠️ Tech Stack
### Frontend
- Next.js (TypeScript, App Router)  
- TailwindCSS + shadcn/ui  
- Supabase client for DB  

### Backend
- Python (FastAPI)  
- OpenAI API (LLM for parsing history + generating questions)  
- Custom JSON parser & profiler  

### Database
- Supabase (PostgreSQL)  
  - `users` → id, name, personality_type  
  - `questions` → personalized test questions  
  - `answers` → user responses  
  - `contracts` → type, stake, status, peer links  
  - `leaderboard` → user_id, points, streaks  

### Extension
- Chrome Extension (Manifest v3)  
- JS + simple overlay injection for blocking & nudges  
- Talks to Supabase for timer + contract checks  

---

## 📂 Project Structure
mindshift/
├── frontend/ # Next.js app (Ilan + Rohan)
│ ├── app/ # Pages (dashboard, leaderboard, contracts, questions)
│ ├── components/ # Navbar, Card, Form, TimerUI
│ ├── lib/ # API + Supabase clients
│ └── styles/
│
├── backend/ # FastAPI (Hadee)
│ ├── main.py # Routes
│ ├── services/ # Parser, question_gen, profiler
│ └── requirements.txt
│
├── extension/ # Chrome Extension (Ilan)
│ ├── manifest.json
│ ├── background.js
│ ├── content.js
│ └── popup.html
│
├── database/ # Supabase schema & migrations
│ └── schema.sql
│
├── docs/ # Extra documentation
│ ├── api_contract.md
│ └── demo.md
│
└── README.md


---

## 👥 Team Roles
- **Ilan** → Project boilerplate (Next.js + Supabase), Chrome extension (timer + blocking), AI prompt design, Git setup.  
- **Hadee** → Backend (FastAPI), ChatGPT history JSON parsing, personalized test generation, profile assignment logic.  
- **Rohan** → Leaderboard page (frontend + Supabase integration).  
- **TBD** → Contracts logic + Dashboard polish (can be split later).  

---

## 🔗 Integration Rules
- Frontend ↔ Backend via `lib/api.ts`.  
- Supabase = single source of truth (users, contracts, leaderboard).  
- No direct fetches from components → always go through API client.  
- Shared contracts documented in `/docs/api_contract.md`.  

---

## ⏱️ Hackathon Plan
**Hour 0–4:**  
- Ilan sets up boilerplate + repo.  
- Hadee mocks JSON → starts parser.  
- Rohan stubs leaderboard page.  

**Hour 4–12:**  
- Hadee → full pipeline: JSON → custom questions → profile.  
- Ilan → Chrome extension (block + nudge).  
- Rohan → leaderboard with mock data.  

**Hour 12–20:**  
- Connect backend → frontend.  
- Supabase schema setup.  
- First pass contracts (peer + money).  

**Hour 20–24:**  
- Polish UI (dashboard, nudges).  
- Preload demo JSON.  
- Script demo flow.  

---

## 🎤 Judge Demo Flow
1. Upload ChatGPT history → see **personalized questions** generated.  
2. User answers → system assigns personality profile.  
3. Open distraction site → **blocker overlay** triggers with profile-based nudge.  
4. Set a contract (e.g., Peer Contract) → simulate failure → peer gets reward.  
5. Show **Leaderboard** and **Dashboard** with points/streaks.  
6. Close with vision: *scaling to social media integration, deeper contracts, adaptive AI coach.*  

---

## 🚀 Vision Beyond Hackathon
- Real-time integration with Instagram/TikTok/YouTube feeds.  
- Adaptive nudges that evolve as your profile changes.  
- More contract types (charity loss, mentor mode, random punishments).  
- Community features (peer groups, challenges, shared streaks).  
