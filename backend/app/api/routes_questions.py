from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.api.schemas import QuestionsOut, QuestionsIn
from app.services.question_service import generate_questions
from app.services.mbti_questions import GENERAL_MBTI_15

router = APIRouter()

@router.get("/", response_model=QuestionsOut, summary="Get personalized questions for a user")
def get_questions(user_id: str, themes: Optional[str] = None):
    try:
        # Parse optional CSV themes from query param
        theme_list: Optional[List[str]] = None
        if themes:
            theme_list = [t.strip() for t in themes.split(",") if t.strip()]

        questions = generate_questions(user_id, themes=theme_list)
        return {"user_id": user_id, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {e}")

@router.get("/general", response_model=QuestionsOut, summary="Get 15 general MBTI questions")
def get_general_questions(user_id: str = "anonymous"):
    try:
        return {"user_id": user_id, "questions": GENERAL_MBTI_15}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting general questions: {e}")

@router.post("/", response_model=QuestionsOut, summary="Generate questions with optional themes and MBTI hint")
def post_questions(payload: QuestionsIn):
    try:
        questions = generate_questions(payload.user_id, themes=payload.themes, mbti_hint=payload.mbti_hint)
        return {"user_id": payload.user_id, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {e}")
