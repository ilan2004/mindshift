from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Any

from ..services import profiler

router = APIRouter(prefix="/profile", tags=["profile"])


class Answer(BaseModel):
    question_id: str
    value: int


class AssignProfileRequest(BaseModel):
    answers: List[Answer]


@router.post("/assign")
def assign_profile(payload: AssignProfileRequest) -> dict:
    profile = profiler.assign_profile([a.model_dump() for a in payload.answers])
    return {"profile": profile}
