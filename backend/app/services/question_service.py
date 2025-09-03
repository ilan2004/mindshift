# app/services/question_service.py

from typing import List, Optional
from app.services.groq_service import generate_questions_from_themes

HISTORY_BASED_FALLBACK_15: List[str] = [
    "I prefer planning my study/work blocks in advance rather than deciding on the spot.",
    "I’m energized by starting new projects more than finishing existing ones.",
    "I rely on structured schedules and checklists to stay productive.",
    "I prioritize logic and objective criteria over personal values when making decisions.",
    "I feel most focused when working alone with minimal interruptions.",
    "I enjoy brainstorming multiple possibilities before committing to a plan.",
    "I often reflect on patterns and systems behind problems rather than surface details.",
    "I prefer clear deadlines and milestones to keep momentum.",
    "I’m comfortable giving direct feedback to improve outcomes.",
    "I notice when my energy dips and proactively take short, intentional breaks.",
    "I adapt my environment (noise, lighting, location) to maximize deep focus.",
    "I’m more productive when tasks ladder up to a long-term vision or strategy.",
    "I prefer measurable targets (e.g., 3 pomodoros) to open-ended sessions.",
    "I tend to analyze before acting, even if it takes extra time.",
    "I feel satisfied when I can optimize or improve the process, not just complete tasks.",
]

def _ensure_15(items: List[str], fallback_pool: List[str]) -> List[str]:
    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for it in items:
        it = it.strip()
        if it and it not in seen:
            seen.add(it)
            deduped.append(it)
    # If too many, slice
    if len(deduped) >= 15:
        return deduped[:15]
    # If too few, top up from fallback_pool
    for q in fallback_pool:
        if len(deduped) >= 15:
            break
        if q not in seen:
            seen.add(q)
            deduped.append(q)
    # Final guard: ensure exactly 15 even if fallback_pool is small
    return (deduped + fallback_pool)[:15]

# For history-based, MBTI-aligned question generation
def generate_questions(user_id: str, themes: Optional[List[str]] = None, mbti_hint: Optional[str] = None) -> List[str]:
    """
    Generate up to 15 MBTI-aligned questions.
    Preference order:
      1) If themes provided, use Groq to tailor to themes (and mbti_hint if given in the prompt upstream).
      2) Otherwise, use a default small theme set.
      3) Always ensure exactly 15 items using a fallback list if Groq returns too few or empty.
    """
    effective_themes = themes or ["study", "career", "hobbies"]

    # Call Groq for themed questions
    groq_questions = generate_questions_from_themes(effective_themes)

    # Ensure we return exactly 15 using fallback top-up
    return _ensure_15(groq_questions, HISTORY_BASED_FALLBACK_15)
