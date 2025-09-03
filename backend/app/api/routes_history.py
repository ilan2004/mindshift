from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union
from app.services.history_service import generate_questions

router = APIRouter()

class HistoryPayload(BaseModel):
    user_id: str
    history: List[Union[dict, str]]  # Accepts list of dicts or strings

@router.post("/", summary="Generate personalized questions from user history")
def upload_history(payload: HistoryPayload):
    try:
        questions = generate_questions(payload.history)
        return {"user_id": payload.user_id, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {e}")
