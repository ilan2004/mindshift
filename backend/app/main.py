from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_history, routes_questions, routes_answers, routes_events
import os
from fastapi.responses import PlainTextResponse
from fastapi import Body, HTTPException
from typing import Dict, Set, List

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

# ---------- BLOCKLIST (static MVP) ----------
@app.get("/blocklist/domains.txt", response_class=PlainTextResponse)
def blocklist_domains_txt():
    """
    Return a newline-separated list of domains suitable for DNS/content-blocking lists.
    MVP: static list. Later, make this per-user.
    """
    domains = [
        # Social / short-form
        "www.youtube.com",
        "m.youtube.com",
        "youtube.com",
        "www.tiktok.com",
        "tiktok.com",
        "www.instagram.com",
        "instagram.com",
        # Entertainment
        "www.netflix.com",
        "netflix.com",
        # Add more domains as needed
    ]
    return "\n".join(domains) + "\n"

# ---------- BLOCKLIST (per-user token, in-memory MVP) ----------
# Note: For production persistence, back this with a database (e.g., Supabase). For now,
# we keep an in-memory map which resets on deploy/restart.
_BASE_BLOCKLIST: List[str] = [
    "www.youtube.com", "m.youtube.com", "youtube.com",
    "www.tiktok.com", "tiktok.com",
    "www.instagram.com", "instagram.com",
    "www.netflix.com", "netflix.com",
]
_USER_BLOCKLISTS: Dict[str, Set[str]] = {}

def _get_user_set(token: str) -> Set[str]:
    s = _USER_BLOCKLISTS.get(token)
    if s is None:
        s = set()
        _USER_BLOCKLISTS[token] = s
    return s

@app.get("/blocklist/{token}.txt", response_class=PlainTextResponse)
def blocklist_token_txt(token: str):
    """Return the combined base + user-specific domains as newline-separated text."""
    user_set = _get_user_set(token)
    combined = list(dict.fromkeys([*sorted(_BASE_BLOCKLIST), *sorted(user_set)]))
    return "\n".join(combined) + "\n"

@app.get("/blocklist/{token}.json")
def blocklist_token_json(token: str):
    user_set = _get_user_set(token)
    return {
        "base": sorted(_BASE_BLOCKLIST),
        "custom": sorted(user_set),
        "count": len(_BASE_BLOCKLIST) + len(user_set),
    }

@app.post("/blocklist/{token}")
def blocklist_add(token: str, payload: dict = Body(...)):
    """Add one or more domains. Accepts {domain: str} or {domains: [str, ...]}"""
    domains: List[str] = []
    if isinstance(payload, dict):
        if "domain" in payload and isinstance(payload["domain"], str):
            domains.append(payload["domain"]) 
        if "domains" in payload and isinstance(payload["domains"], list):
            for d in payload["domains"]:
                if isinstance(d, str):
                    domains.append(d)
    domains = [d.strip().lower() for d in domains if isinstance(d, str) and d.strip()]
    if not domains:
        raise HTTPException(status_code=400, detail="No domains provided")
    user_set = _get_user_set(token)
    for d in domains:
        # very light validation: contains at least one dot
        if "." not in d:
            continue
        user_set.add(d)
    return {"custom": sorted(user_set)}

@app.delete("/blocklist/{token}")
def blocklist_remove(token: str, payload: dict = Body(...)):
    """Remove a domain. Accepts {domain: str}."""
    domain = (payload or {}).get("domain")
    if not domain or not isinstance(domain, str):
        raise HTTPException(status_code=400, detail="domain required")
    domain = domain.strip().lower()
    user_set = _get_user_set(token)
    if domain in user_set:
        user_set.remove(domain)
    return {"custom": sorted(user_set)}

# ---------- ROUTES ----------
# Personalized history-based questions
app.include_router(routes_history.router, prefix="/history", tags=["History"])

# General ready-made MBTI questions
app.include_router(routes_questions.router, prefix="/questions", tags=["Questions"])

# User answers submission and trait mapping
app.include_router(routes_answers.router, prefix="/answers", tags=["Answers"])

# Events & recommendations
app.include_router(routes_events.router, prefix="/events", tags=["Events"])
