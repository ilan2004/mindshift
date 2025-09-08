from fastapi import APIRouter, Query
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.services.question_service import get_static_questions

router = APIRouter()

class QuestionOut(BaseModel):
    question: str
    options: List[str]  # e.g., ["Agree", "Disagree"]

@router.get("/", response_model=List[QuestionOut], summary="Get ready-made MBTI questions")
def get_questions(user_id: Optional[str] = Query(None, description="User ID for tracking"), 
                 themes: Optional[str] = Query(None, description="Comma-separated themes")):
    """
    Returns the 16 ready-made MBTI questions for general personality test.
    user_id and themes are accepted for API compatibility but not currently used.
    """
    return get_static_questions()
