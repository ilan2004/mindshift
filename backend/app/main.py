from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_history, routes_questions, routes_answers, routes_events
import os

# ---------- FASTAPI APP ----------
app = FastAPI(
    title="MindShift API with Groq",
    version="0.3.0",
    description="AI-powered productivity assistant with personality profiling 🚀"
)

# ---------- CORS ----------
# Read allowed origins from env (comma-separated). Fallback to common localhost origins.
_env_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
origins = [o.strip().rstrip('/') for o in _env_origins.split(",") if o.strip()] or [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
    "https://localhost",
]
# Optional regex to allow wildcard domains (e.g., Vercel previews):
# Example: ^https://.*\.vercel\.app$
origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX", "").strip() or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not origin_regex else [],
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MindShift API with Groq is running 🚀"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# ---------- ROUTES ----------
# Personalized history-based questions
app.include_router(routes_history.router, prefix="/history", tags=["History"])

# General ready-made MBTI questions
app.include_router(routes_questions.router, prefix="/questions", tags=["Questions"])

# User answers submission and trait mapping
app.include_router(routes_answers.router, prefix="/answers", tags=["Answers"])

# Events & recommendations
app.include_router(routes_events.router, prefix="/events", tags=["Events"])
