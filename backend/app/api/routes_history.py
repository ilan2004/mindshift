from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union, Dict
from app.services.history_service import generate_questions, load_chatgpt_history_from_file
import asyncio
from concurrent.futures import ThreadPoolExecutor
import os

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


@router.get("/from-file", summary="Generate questions from public/conversations.json")
async def questions_from_file():
    """
    Reads ChatGPT export at public/conversations.json and returns personalized questions.
    """
    try:
        # Compute project root and file path cross-platform
        here = os.path.dirname(__file__)  # .../backend/app/api
        app_dir = os.path.dirname(here)   # .../backend/app
        backend_dir = os.path.dirname(app_dir)  # .../backend
        project_root = os.path.abspath(os.path.join(backend_dir, ".."))  # project root
        file_path = os.path.join(project_root, "public", "conversations.json")

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="public/conversations.json not found")

        history = load_chatgpt_history_from_file(file_path)
        if not history:
            raise HTTPException(status_code=400, detail="No user messages found in conversations.json")

        structured_questions: List[Dict] = await run_generate_questions(history)
        return {
            "source": "public/conversations.json",
            "questions": structured_questions,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing conversations.json: {e}")
