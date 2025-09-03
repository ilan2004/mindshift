# app/services/history_service.py

from typing import List, Union
from app.services.groq_service import generate_questions_from_themes

def extract_themes(chat_history: List[Union[dict, str]]) -> List[str]:
    """
    Extract key themes from user chat history.
    Supports both list of strings and list of dicts with 'role' and 'content'.
    """
    themes = set()

    for msg in chat_history:
        if isinstance(msg, dict):
            # Only process user messages
            if msg.get("role") != "user":
                continue
            content = msg.get("content", "").lower()
        else:
            content = str(msg).lower()

        # Keyword-based theme extraction
        if any(word in content for word in ["study", "exam", "learn", "read", "course"]):
            themes.add("study")
        if any(word in content for word in ["hobby", "hobbies", "project", "side project"]):
            themes.add("hobbies")
        if any(word in content for word in ["career", "job", "work", "profession"]):
            themes.add("career")
        if any(word in content for word in ["focus", "distraction", "procrastinate", "attention"]):
            themes.add("focus")

    return list(themes)

def generate_questions(chat_history: List[Union[dict, str]]) -> List[str]:
    """
    Full pipeline: extract themes and generate personalized questions via Groq.
    Returns empty list if no themes are detected.
    """
    themes = extract_themes(chat_history)
    if not themes:
        return []

    # Call Groq service to generate questions based on extracted themes
    questions = generate_questions_from_themes(themes)
    if questions:
        return questions

    # Fallback: static theme-based questions if Groq is unavailable or returned nothing
    fallback_bank = {
        "study": [
            "When during the day do you feel most focused for studying?",
            "How do you decide what to study first in a session?",
            "What signals tell you it's time to take a break?",
        ],
        "focus": [
            "What is your most common distraction and how do you currently handle it?",
            "How long can you usually stay in deep focus before needing a pause?",
            "Which environment (noise, light, location) helps you focus best?",
        ],
        "career": [
            "What is your top work priority for this week and why?",
            "Which task would create the most impact if completed today?",
            "What is blocking your progress on your current project?",
        ],
        "hobbies": [
            "Which hobby energizes you the most right now?",
            "How do you make time for side projects during busy weeks?",
            "What small step can you take today to advance a hobby project?",
        ],
    }

    deduped: List[str] = []
    seen = set()
    for t in themes:
        for q in fallback_bank.get(t, []):
            if q not in seen:
                seen.add(q)
                deduped.append(q)

    # Ensure we return something reasonable
    if not deduped:
        deduped = [
            "What would make the next hour feel productive for you?",
            "What is one distraction you can remove before starting?",
            "What is the smallest next step you can take right now?",
        ]

    return deduped
