from fastapi import APIRouter
from typing import List, Dict
from pydantic import BaseModel
from app.services.question_service import get_static_questions

router = APIRouter()

class QuestionOut(BaseModel):
    question: str
    options: List[str]  # e.g., ["Agree", "Disagree"]

@router.get("/", response_model=List[QuestionOut], summary="Get ready-made MBTI questions")
def get_questions():
    """
    Returns the 16 ready-made MBTI questions for general personality test.
    """
    return get_static_questions()
