from pydantic import BaseModel
from typing import List, Dict, Optional, Union

# ---------- History ----------
class HistoryIn(BaseModel):
    user_id: str
    history: List[Union[dict, str]]  # Can be raw strings or {role, content} dicts

class QuestionsOut(BaseModel):
    user_id: str
    questions: List[str]

# ---------- Questions & Answers ----------
class QuestionsIn(BaseModel):
    user_id: str
    themes: Optional[List[str]] = None
    mbti_hint: Optional[str] = None

class AnswersIn(BaseModel):
    user_id: str
    answers: Dict[str, str]  # {question: answer}

class TraitOut(BaseModel):
    user_id: str
    traits: List[str]  # e.g. ["Achiever", "Analyst"]

# ---------- Events ----------
class EventIn(BaseModel):
    user_id: str
    event_type: str  # e.g. "distraction", "streak_break", "streak_success"
    details: Optional[Dict[str, str]] = None  # flexible extra info

class RecommendationOut(BaseModel):
    user_id: str
    recommendations: List[str]
