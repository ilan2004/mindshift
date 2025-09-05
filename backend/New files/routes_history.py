from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union, Dict
from app.services.history_service import generate_questions
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

# Thread pool for blocking Groq calls
executor = ThreadPoolExecutor(max_workers=3)

class HistoryPayload(BaseModel):
    user_id: str
    history: List[Union[dict, str]]  # Accepts list of dicts or strings

class QuestionOut(BaseModel):
    question: str
    options: List[str]  # e.g., ["Agree", "Disagree"]

async def run_generate_questions(history: List[Union[dict, str]]) -> List[Dict]:
    """
    Run blocking generate_questions function in a thread pool.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, generate_questions, history)

@router.post("/", summary="Generate personalized questions from user history")
async def upload_history(payload: HistoryPayload):
    """
    Accepts user chat history and returns realistic, personalized first-person statements.
    Returns structured statements with Agree/Disagree options.
    """
    try:
        structured_questions: List[Dict] = await run_generate_questions(payload.history)
        return {
            "user_id": payload.user_id,
            "questions": structured_questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {e}")
