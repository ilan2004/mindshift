from typing import Dict, List
import json
from pathlib import Path

# Load personality JSON
DATA_PATH = Path("app/data/personalities.json")
try:
    PERSONALITY_DATA = json.loads(DATA_PATH.read_text())
except Exception as e:
    print(f"Error loading personality data: {e}")
    PERSONALITY_DATA = []

def map_answers_to_traits(answers: Dict[str, str], flexibility: int = 3) -> List[str]:
    """
    Map answers to personality traits using keyword matching.
    Supports hybrid profiles if scores are within ±flexibility.
    """
    if not PERSONALITY_DATA:
        return ["Unknown"]

    # Initialize scores
    trait_scores = {p['trait']: 0 for p in PERSONALITY_DATA}

    for answer_text in answers.values():
        normalized = answer_text.strip().lower()
        for trait_data in PERSONALITY_DATA:
            for keyword in trait_data.get("keywords", []):
                if keyword.lower() in normalized:
                    trait_scores[trait_data['trait']] += 1

    if not trait_scores:
        return ["Unknown"]

    max_score = max(trait_scores.values())
    if max_score == 0:
        return ["Unclassified"]

    # Select all traits within ±flexibility of max_score
    top_traits = [t for t, score in trait_scores.items() if score >= max_score - flexibility]

    return top_traits

def map_answers_to_mbti(answers: Dict[str, str]) -> str:
    """
    Very simple heuristic to derive an MBTI-like label from free-text answers.
    This is a placeholder and should be replaced with a real model.
    """
    # Default preferences
    I_E = 0  # positive => I, negative => E
    N_S = 0  # positive => N, negative => S
    T_F = 0  # positive => T, negative => F
    J_P = 0  # positive => J, negative => P

    for text in answers.values():
        t = (text or "").lower()
        # Introversion / Extraversion
        if any(k in t for k in ["alone", "solo", "reflect", "quiet", "independent"]):
            I_E += 1
        if any(k in t for k in ["team", "friends", "talk", "social", "network"]):
            I_E -= 1

        # iNtuition / Sensing
        if any(k in t for k in ["concept", "theory", "future", "idea", "pattern"]):
            N_S += 1
        if any(k in t for k in ["detail", "practical", "today", "data", "facts"]):
            N_S -= 1

        # Thinking / Feeling
        if any(k in t for k in ["logic", "objective", "analyze", "metrics", "reason"]):
            T_F += 1
        if any(k in t for k in ["empathy", "feel", "values", "support", "people"]):
            T_F -= 1

        # Judging / Perceiving
        if any(k in t for k in ["plan", "schedule", "deadline", "organized", "structure"]):
            J_P += 1
        if any(k in t for k in ["flexible", "spontaneous", "explore", "adapt", "open-ended"]):
            J_P -= 1

    mbti = (
        ("I" if I_E >= 0 else "E") +
        ("N" if N_S >= 0 else "S") +
        ("T" if T_F >= 0 else "F") +
        ("J" if J_P >= 0 else "P")
    )
    return mbti
