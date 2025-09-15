# Nudge Backend (FastAPI)

## Quick start

```bash
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints (mock):
- GET /api/health
- POST /api/questions/generate { history_text }
- POST /api/profile/assign { answers: [{question_id, value}] }

Integrations later:
- Supabase client
- OpenAI-based question generation

## Supabase setup (App + Extension data)

We use Supabase (Postgres) to store focus sessions and blocked domains. Create a project at https://supabase.com/ and note the Project URL and anon key.

1) Environment variables (Next.js)

Create a `.env.local` at the repo root (`nudge/`) with:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2) Install client library (JS app)

```
npm install @supabase/supabase-js
```

3) Database schema

Apply `database/schema.sql` to your Supabase project (SQL Editor). This includes:

- `focus_sessions`: tracks focus/break sessions and timing
- `blocked_domains`: stores per-user blocked domains

4) Using the client

The app exports a singleton creator at `src/lib/supabase.js` which reads the env vars and initializes the client.

5) Authentication (optional for now)

For MVP we can use an anonymous user or a temporary user id per browser. Later, wire proper auth (Supabase Auth, OAuth, etc.) and reference `user_id` in tables.
