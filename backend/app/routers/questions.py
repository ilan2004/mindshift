from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from ..services import question_gen

router = APIRouter(prefix="/questions", tags=["questions"])


class GenerateQuestionsRequest(BaseModel):
    history_text: str


@router.post("/generate")
def generate_questions(payload: GenerateQuestionsRequest) -> dict:
    questions = question_gen.generate_questions(payload.history_text)
    return {"questions": questions}
