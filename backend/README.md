# MindShift Backend (FastAPI)

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
