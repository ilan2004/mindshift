# app/services/groq_service.py

import os
import requests
from typing import List
from dotenv import load_dotenv

# --- Config ---
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # or "llama-3.1-70b-versatile"


def _call_groq(prompt: str) -> str:
    """
    Calls Groq Chat Completions API with strict system instruction.
    Returns raw assistant content string.
    """
    if not GROQ_API_KEY:
        # No key configured; skip remote call
        return ""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant. "
                    "When asked to generate questions, output ONLY the questions, "
                    "one per line, no numbering, no bullets, no extra commentary."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 600,
        "stream": False,
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as e:
        print(f"Groq HTTP error: {e} | Response: {getattr(e, 'response', None) and e.response.text}")
        return ""
    except requests.exceptions.RequestException as e:
        print(f"Groq request error: {e}")
        return ""
    except (KeyError, IndexError) as e:
        print(f"Groq parse error: {e}")
        return ""


def generate_questions_from_themes(themes: List[str]) -> List[str]:
    """
    Generate 10–15 personalized productivity questions from themes using Groq.
    Returns a list of clean question strings.
    """
    if not themes:
        return []

    prompt = (
        "Generate 10–15 highly personalized productivity questions tailored to these themes: "
        f"{themes}. Output ONLY the questions, one per line, no numbering, no bullets."
    )

    content = _call_groq(prompt)
    if not content:
        return []

    # Split and clean lines
    lines = [ln.strip() for ln in content.split("\n")]
    cleaned = []
    for ln in lines:
        if not ln:
            continue
        if ln[:3].isdigit() and ln[1:2] == ".":
            ln = ln.split(".", 1)[1].strip()
        for prefix in ("- ", "* ", "• "):
            if ln.startswith(prefix):
                ln = ln[len(prefix):].strip()
        cleaned.append(ln)

    return cleaned
