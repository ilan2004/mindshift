import os
import requests
from typing import List
from dotenv import load_dotenv

# --- Config ---
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or "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"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

# --- Fallback questions if Groq fails ---
FALLBACK_QUESTIONS = [
    "I feel productive when I complete tasks without distractions.",
    "I actively make time for my hobbies and interests.",
    "I focus best when I minimize interruptions.",
    "I set clear priorities for my work and stick to them.",
]

def _call_groq(prompt: str) -> str:
    """
    Calls Groq API with strict system instructions for first-person statements.
    Returns the assistant response as a string.
    """
    if not GROQ_API_KEY:
        print("Groq API key not set. Using fallback statements.")
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
                    "Generate ONLY first-person statements suitable for 'Agree' or 'Disagree'. "
                    "Do NOT output questions. "
                    "Output one statement per line, no numbering, no bullets, no commentary."
                )
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 600,
        "stream": False,
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        print(f"Groq API call failed: {e}")
        return ""


def generate_questions_from_themes(themes: List[str]) -> List[str]:
    """
    Generate 10–15 personalized first-person statements based on themes.
    Falls back to static statements if Groq fails.
    """
    if not themes:
        return FALLBACK_QUESTIONS.copy()

    prompt = (
        f"Generate 10–15 first-person statements based on these themes: {themes}. "
        "Each statement should describe a real-world habit, behavior, or scenario related to the theme. "
        "Statements must be suitable for 'Agree' or 'Disagree' responses. "
        "Do NOT output questions. "
        "Use real-life scenarios wherever possible. "
        "Output one statement per line, no numbering, no bullets, no commentary."
    )

    content = _call_groq(prompt)
    if not content:
        print("Groq returned empty response. Using fallback statements.")
        return FALLBACK_QUESTIONS.copy()

    # Clean and deduplicate lines
    lines = [line.strip() for line in content.split("\n") if line.strip()]
    seen = set()
    cleaned = []
    for ln in lines:
        if ln not in seen:
            seen.add(ln)
            # Ensure each statement ends with a period
            if not ln.endswith("."):
                ln += "."
            cleaned.append(ln)

    return cleaned if cleaned else FALLBACK_QUESTIONS.copy()
