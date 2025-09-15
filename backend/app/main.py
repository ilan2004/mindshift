from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_history, routes_questions, routes_answers, routes_events
import os
from fastapi.responses import PlainTextResponse
from fastapi import Body, HTTPException
from typing import Dict, Set, List
import requests

# ---------- FASTAPI APP ----------
app = FastAPI(
    title="Nudge API with Groq",
    version="0.3.0",
    description="AI-powered productivity assistant with personality profiling 🚀"
)

# ---------- CORS ----------
# Read allowed origins from env (comma-separated). Fallback to common localhost origins.
_env_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
origins = [o.strip().rstrip('/') for o in _env_origins.split(",") if o.strip()] or [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "https://localhost",
]
# Optional regex to allow wildcard domains (e.g., Vercel previews):
# Example: ^https://.*\.vercel\.app$
origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX", "").strip() or r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

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
    return {"message": "Nudge API with Groq is running 🚀"}

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

# ---------- BLOCKLIST (per-user token) ----------
# Base list always included
_BASE_BLOCKLIST: List[str] = [
    "www.youtube.com", "m.youtube.com", "youtube.com",
    "www.tiktok.com", "tiktok.com",
    "www.instagram.com", "instagram.com",
    "www.netflix.com", "netflix.com",
]

# Supabase config (persistence)
_SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
_SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE", "")
_SB_TABLE = "blocklist_domains"

def _sb_enabled() -> bool:
    return bool(_SUPABASE_URL and _SUPABASE_SERVICE_ROLE)

def _sb_headers():
    return {
        "apikey": _SUPABASE_SERVICE_ROLE,
        "Authorization": f"Bearer {_SUPABASE_SERVICE_ROLE}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def _sb_list(token: str) -> List[str]:
    url = f"{_SUPABASE_URL}/rest/v1/{_SB_TABLE}"
    params = {
        "select": "domain",
        "token": f"eq.{token}",
        "order": "domain.asc",
    }
    resp = requests.get(url, headers=_sb_headers(), params=params, timeout=10)
    resp.raise_for_status()
    rows = resp.json()
    return sorted({(row.get("domain") or "").strip().lower() for row in rows if row.get("domain")})

def _sb_add(token: str, domains: List[str]) -> List[str]:
    # Upsert unique (token, domain)
    url = f"{_SUPABASE_URL}/rest/v1/{_SB_TABLE}"
    params = {"on_conflict": "token,domain"}
    payload = [{"token": token, "domain": d} for d in domains]
    resp = requests.post(url, headers={**_sb_headers(), "Prefer": "resolution=merge-duplicates"}, params=params, json=payload, timeout=10)
    resp.raise_for_status()
    return _sb_list(token)

def _sb_remove(token: str, domain: str) -> List[str]:
    url = f"{_SUPABASE_URL}/rest/v1/{_SB_TABLE}"
    params = {
        "token": f"eq.{token}",
        "domain": f"eq.{domain}",
    }
    resp = requests.delete(url, headers=_sb_headers(), params=params, timeout=10)
    resp.raise_for_status()
    return _sb_list(token)

# In-memory fallback when Supabase is not configured
_USER_BLOCKLISTS: Dict[str, Set[str]] = {}

def _mem_get(token: str) -> Set[str]:
    s = _USER_BLOCKLISTS.get(token)
    if s is None:
        s = set()
        _USER_BLOCKLISTS[token] = s
    return s

def _list_custom(token: str) -> List[str]:
    if _sb_enabled():
        try:
            return _sb_list(token)
        except Exception:
            pass
    return sorted(_mem_get(token))

def _add_custom(token: str, domains: List[str]) -> List[str]:
    if _sb_enabled():
        try:
            return _sb_add(token, domains)
        except Exception:
            pass
    s = _mem_get(token)
    for d in domains:
        s.add(d)
    return sorted(s)

def _remove_custom(token: str, domain: str) -> List[str]:
    if _sb_enabled():
        try:
            return _sb_remove(token, domain)
        except Exception:
            pass
    s = _mem_get(token)
    s.discard(domain)
    return sorted(s)

@app.get("/blocklist/{token}.txt", response_class=PlainTextResponse)
def blocklist_token_txt(token: str):
    """Return the combined base + user-specific domains as newline-separated text."""
    custom = _list_custom(token)
    combined = list(dict.fromkeys([*sorted(_BASE_BLOCKLIST), *custom]))
    return "\n".join(combined) + "\n"

@app.get("/blocklist/{token}.filter", response_class=PlainTextResponse)
def blocklist_token_adblock(token: str):
    """Return Adblock-compatible filter rules for base + user-specific domains.
    Example lines: ||twitter.com^
    """
    custom = _list_custom(token)
    combined = list(dict.fromkeys([*sorted(_BASE_BLOCKLIST), *custom]))
    # Convert bare domains to Adblock filter syntax
    lines = [f"||{d}^" for d in combined]
    # Add a header comment
    header = [
        "! Nudge Blocklist (Adblock format)",
        "! Syntax: ||domain^",
        "",
    ]
    return "\n".join([*header, *lines]) + "\n"

@app.get("/blocklist/{token}.json")
def blocklist_token_json(token: str):
    custom = _list_custom(token)
    return {
        "base": sorted(_BASE_BLOCKLIST),
        "custom": custom,
        "count": len(_BASE_BLOCKLIST) + len(custom),
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
    # very light validation
    domains = [d for d in domains if "." in d]
    custom = _add_custom(token, domains)
    return {"custom": custom}

@app.delete("/blocklist/{token}")
def blocklist_remove(token: str, payload: dict = Body(...)):
    """Remove a domain. Accepts {domain: str}."""
    domain = (payload or {}).get("domain")
    if not domain or not isinstance(domain, str):
        raise HTTPException(status_code=400, detail="domain required")
    domain = domain.strip().lower()
    custom = _remove_custom(token, domain)
    return {"custom": custom}

# ---------- ROUTES ----------
# Personalized history-based questions
app.include_router(routes_history.router, prefix="/history", tags=["History"])

# General ready-made MBTI questions
app.include_router(routes_questions.router, prefix="/questions", tags=["Questions"])

# User answers submission and trait mapping
app.include_router(routes_answers.router, prefix="/answers", tags=["Answers"])

# Events & recommendations
app.include_router(routes_events.router, prefix="/events", tags=["Events"])
