# app/api/routes_answers.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.personality_service import (
    map_answers_to_traits,
    map_answers_to_mbti,
    map_answers_to_mbti_likert,
)
from app.services.question_service import STATIC_QUESTIONS

router = APIRouter()

# ---------- Request & Response Schemas ----------
class AnswerRequest(BaseModel):
    user_id: str
    answers: Dict[str, Any]   # {question: 1..5 or free-text}

class ProfileResponse(BaseModel):
    user_id: str
    profile: str              # MBTI type or primary trait
    scores: Dict[str, int]    # Scores per trait

# ---------- Endpoint ----------
@router.post("/", response_model=ProfileResponse)
def submit_answers(data: AnswerRequest):
    # Map answers to personality traits
    traits = map_answers_to_traits(data.answers, flexibility=3)

    # Try Likert-based mapping first if values look numeric 1..5
    use_likert = False
    try:
        if data.answers:
            # If most values parse to an int within 1..5, treat as Likert
            parsed = 0
            for v in data.answers.values():
                iv = int(v) if not isinstance(v, int) else v
                if 1 <= iv <= 5:
                    parsed += 1
            use_likert = parsed >= max(1, len(data.answers) // 2)
    except Exception:
        use_likert = False

    axis_scores: Dict[str, int] = {}
    if use_likert:
        # Convert all to ints safely
        likert_payload: Dict[str, int] = {}
        for k, v in data.answers.items():
            try:
                likert_payload[k] = int(v)
            except Exception:
                continue
        mbti = map_answers_to_mbti_likert(likert_payload)

        # Also compute axis totals for debugging/visibility in scores
        E = I = S = N = T = F = J = P = 0
        ei_e_indices = {0, 1, 2}
        ei_i_indices = {3, 4, 5}
        sn_s_indices = {6, 7, 8}
        sn_n_indices = {9, 10, 11}
        tf_t_indices = {12, 13, 14}
        tf_f_indices = {15, 16, 17}
        jp_j_indices = {18, 19, 20}
        jp_p_indices = {21, 22, 23}
        text_to_index = {q: i for i, q in enumerate(STATIC_QUESTIONS)}
        for q_text, v in likert_payload.items():
            if not (1 <= v <= 5):
                continue
            idx = text_to_index.get(q_text)
            if idx is None:
                continue
            comp = 6 - v
            if idx in ei_e_indices:
                E += v; I += comp
            elif idx in ei_i_indices:
                I += v; E += comp
            if idx in sn_s_indices:
                S += v; N += comp
            elif idx in sn_n_indices:
                N += v; S += comp
            if idx in tf_t_indices:
                T += v; F += comp
            elif idx in tf_f_indices:
                F += v; T += comp
            if idx in jp_j_indices:
                J += v; P += comp
            elif idx in jp_p_indices:
                P += v; J += comp
        axis_scores = {"E": E, "I": I, "S": S, "N": N, "T": T, "F": F, "J": J, "P": P}
    else:
        # Fallback to keyword heuristic
        mbti = map_answers_to_mbti(data.answers)

    # Generate scores dict: include placeholder trait scores and axis scores when available
    scores = {trait: 100 for trait in traits}
    scores.update(axis_scores)

    return ProfileResponse(
        user_id=data.user_id,
        profile=mbti,   # Use MBTI type as main profile
        scores=scores
    )
