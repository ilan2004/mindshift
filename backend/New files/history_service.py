from typing import List, Union, Dict
from app.services.groq_service import generate_questions_from_themes

def extract_themes(chat_history: List[Union[dict, str]]) -> List[str]:
    """
    Extract key themes from user chat history.
    Supports both list of strings and list of dicts with 'role' and 'content'.
    """
    themes = set()

    for msg in chat_history:
        if isinstance(msg, dict):
            if msg.get("role") != "user":
                continue
            content = msg.get("content", "").lower()
        else:
            content = str(msg).lower()

        if any(word in content for word in ["study", "exam", "learn", "read", "course"]):
            themes.add("study")
        if any(word in content for word in ["hobby", "hobbies", "project", "side project"]):
            themes.add("hobbies")
        if any(word in content for word in ["career", "job", "work", "profession"]):
            themes.add("career")
        if any(word in content for word in ["focus", "distraction", "procrastinate", "attention"]):
            themes.add("focus")

    return list(themes)


def generate_questions(chat_history: List[Union[dict, str]]) -> List[Dict]:
    """
    Generate personalized first-person statements for Agree/Disagree answers
    based on user chat history. Uses Groq API first, falls back to static statements.
    Returns a list of dicts: {question: str, options: List[str]}.
    """
    themes = extract_themes(chat_history)
    questions: List[Dict] = []

    if themes:
        # Try Groq-generated statements
        raw_statements = generate_questions_from_themes(themes)
        for stmt in raw_statements:
            questions.append({
                "question": stmt,
                "options": ["Agree", "Disagree"]
            })

    # Fallback static statements if Groq fails
    if not questions:
        fallback_bank = {
            "study": [
                "I feel most focused for studying in the morning.",
                "I usually decide what to study first based on urgency.",
                "I take a short break when my concentration fades.",
            ],
            "focus": [
                "I easily get distracted by my phone or social media.",
                "I can maintain deep focus for long periods without interruption.",
                "The environment greatly affects my concentration.",
            ],
            "career": [
                "I have a clear top priority for my work each week.",
                "I focus on tasks that create the most impact first.",
                "I feel blocked in my current project by specific obstacles.",
            ],
            "hobbies": [
                "I actively make time for my hobbies during busy weeks.",
                "Certain hobbies energize me more than others.",
                "I take small steps daily to progress on personal projects.",
            ],
        }

        seen = set()
        for t in themes:
            for q in fallback_bank.get(t, []):
                if q not in seen:
                    seen.add(q)
                    questions.append({"question": q, "options": ["Agree", "Disagree"]})

        # Minimal default statements
        if not questions:
            questions = [
                {"question": "I can make the next hour productive if I focus properly.", "options": ["Agree", "Disagree"]},
                {"question": "I can identify and remove at least one distraction before starting.", "options": ["Agree", "Disagree"]},
                {"question": "I can take a small next step toward a goal right now.", "options": ["Agree", "Disagree"]},
            ]

    return questions
