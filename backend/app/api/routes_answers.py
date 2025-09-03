# app/api/routes_answers.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.services.personality_service import map_answers_to_traits, map_answers_to_mbti

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
    
    # Map answers to MBTI type
    mbti = map_answers_to_mbti(data.answers)
    
    # Generate scores dict (simple scoring for demonstration)
    scores = {trait: 100 for trait in traits}  # Assign max score to detected traits
    
    return ProfileResponse(
        user_id=data.user_id,
        profile=mbti,   # Use MBTI type as main profile
        scores=scores
    )
