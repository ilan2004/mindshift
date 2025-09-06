# app/api/routes_answers.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.services.personality_service import (
    map_answers_to_traits,
    map_answers_to_mbti,
    map_answers_to_mbti_likert,
)

router = APIRouter()

# ---------- Request & Response Schemas ----------
class AnswerRequest(BaseModel):
    user_id: str
    answers: Dict[str, str]   # {question: "Agree"/"Disagree"}

class ProfileResponse(BaseModel):
    user_id: str
    profile: str              # MBTI type or primary trait
    scores: Dict[str, int]    # Scores per trait

# ---------- Endpoint ----------
@router.post("/", response_model=ProfileResponse)
def submit_answers(data: AnswerRequest):
    # Map answers to personality traits
    traits = map_answers_to_traits(data.answers, flexibility=3)

    # Try Likert-based mapping first if values look numeric 1..5
    use_likert = False
    try:
        if data.answers:
            # If most values parse to an int within 1..5, treat as Likert
            parsed = 0
            for v in data.answers.values():
                iv = int(v) if not isinstance(v, int) else v
                if 1 <= iv <= 5:
                    parsed += 1
            use_likert = parsed >= max(1, len(data.answers) // 2)
    except Exception:
        use_likert = False

    if use_likert:
        # Convert all to ints safely
        likert_payload: Dict[str, int] = {}
        for k, v in data.answers.items():
            try:
                likert_payload[k] = int(v)
            except Exception:
                continue
        mbti = map_answers_to_mbti_likert(likert_payload)
    else:
        # Fallback to keyword heuristic
        mbti = map_answers_to_mbti(data.answers)

    # Generate scores dict (simple scoring for demonstration)
    scores = {trait: 100 for trait in traits}  # Assign max score to detected traits

    return ProfileResponse(
        user_id=data.user_id,
        profile=mbti,   # Use MBTI type as main profile
        scores=scores
    )
