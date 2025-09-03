from pydantic import BaseModel
from typing import List, Optional


class Question(BaseModel):
    id: str
    text: str
    scale: Optional[dict] = None
    options: Optional[List[str]] = None


class Answer(BaseModel):
    question_id: str
    value: int


class Profile(BaseModel):
    type: str
    score: float
