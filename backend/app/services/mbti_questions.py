# app/services/mbti_questions.py

from typing import List

# 15 general MBTI-style Likert items (1–5: Strongly Disagree → Strongly Agree)
GENERAL_MBTI_15: List[str] = [
    "I draw energy from solitary activities more than social gatherings.",
    "I prefer clear structure and planning over spontaneity.",
    "I trust data and logic more than personal values when choosing.",
    "I focus on future possibilities more than present facts.",
    "I enjoy organizing people and tasks to reach a goal.",
    "I communicate in a direct, concise manner.",
    "I prefer consistent routines to frequently changing plans.",
    "I like understanding how systems work under the hood.",
    "I feel motivated by measurable progress and achievements.",
    "I am comfortable making tough decisions even if they are unpopular.",
    "I analyze situations objectively rather than considering how others might feel first.",
    "I set long-term goals and break them into concrete steps.",
    "I prefer to finish one task before starting another.",
    "I reflect on past performance to optimize future outcomes.",
    "I naturally take charge in group settings when needed.",
]
