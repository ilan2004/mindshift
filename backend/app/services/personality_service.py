from typing import Dict, List
import json
from pathlib import Path
from app.services.question_service import STATIC_QUESTIONS

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
        normalized = str(answer_text or "").strip().lower()
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

    # Improved tie-breaking with random selection to avoid bias
    import random
    
    # Use threshold-based decisions with better defaults
    threshold = 1  # Need at least 1 point difference to declare winner
    
    if abs(I_E) >= threshold:
        ei_letter = "I" if I_E > 0 else "E"
    else:
        # Tie or close - random selection
        ei_letter = random.choice(["E", "I"])
    
    if abs(N_S) >= threshold:
        sn_letter = "N" if N_S > 0 else "S"
    else:
        # Tie or close - random selection
        sn_letter = random.choice(["S", "N"])
        
    if abs(T_F) >= threshold:
        tf_letter = "T" if T_F > 0 else "F"
    else:
        # Tie or close - random selection
        tf_letter = random.choice(["T", "F"])
        
    if abs(J_P) >= threshold:
        jp_letter = "J" if J_P > 0 else "P"
    else:
        # Tie or close - random selection
        jp_letter = random.choice(["J", "P"])
    
    mbti = ei_letter + sn_letter + tf_letter + jp_letter
    
    # Debug logging
    print(f"DEBUG: Keyword MBTI - I_E:{I_E} N_S:{N_S} T_F:{T_F} J_P:{J_P} -> {mbti}")
    
    return mbti

def map_answers_to_mbti_likert(answers: Dict[str, int]) -> str:
    """
    Compute MBTI from Likert-scale responses (1..5) keyed by the exact
    question text from STATIC_QUESTIONS.

    Scoring:
    - For each axis (E/I, S/N, T/F, J/P) we add to both sides using a
      complementary score (e.g., if E item is rated v, add v to E and (6-v) to I).
    - Reverse-coded items are handled by swapping which side receives the direct score.
    """
    # Initialize axis totals
    E = I = S = N = T = F = J = P = 0

    # Index sets per axis (0-based indices in STATIC_QUESTIONS)
    ei_e_indices = {0, 1, 2}  # E phrased
    ei_i_indices = {3}        # I phrased (reverse of E)

    sn_s_indices = {4, 6}     # S phrased
    sn_n_indices = {5, 7}     # N phrased

    tf_t_indices = {8, 10}    # T phrased
    tf_f_indices = {9, 11}    # F phrased

    jp_j_indices = {12, 14}   # J phrased
    jp_p_indices = {13, 15}   # P phrased

    # Build lookup from text -> index (exact match)
    text_to_index = {q: i for i, q in enumerate(STATIC_QUESTIONS)}

    for q_text, val in answers.items():
        try:
            v = int(val)
        except (TypeError, ValueError):
            continue
        if v < 1 or v > 5:
            continue
        idx = text_to_index.get(q_text)
        if idx is None:
            # Unknown question text; skip
            continue

        comp = 6 - v  # complementary score

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

    # Improved tie-breaking logic with thresholds and fallback randomization
    import random
    
    # Use a small threshold to avoid ties - only declare winner if difference >= 2
    threshold = 2
    
    # Calculate differences
    ei_diff = abs(E - I)
    sn_diff = abs(S - N) 
    tf_diff = abs(T - F)
    jp_diff = abs(J - P)
    
    # Determine each axis with better logic
    if ei_diff >= threshold:
        ei_letter = "E" if E > I else "I"
    else:
        # Close scores - use slight bias toward introversion (more common in developer/knowledge workers)
        ei_letter = "I" if I >= E else "E"
    
    if sn_diff >= threshold:
        sn_letter = "S" if S > N else "N"
    else:
        # Close scores - slight bias toward intuition
        sn_letter = "N" if N >= S else "S"
        
    if tf_diff >= threshold:
        tf_letter = "T" if T > F else "F"
    else:
        # Close scores - use random selection to avoid bias
        tf_letter = random.choice(["T", "F"])
        
    if jp_diff >= threshold:
        jp_letter = "J" if J > P else "P"
    else:
        # Close scores - slight bias toward perceiving (more flexible)
        jp_letter = "P" if P >= J else "J"
    
    letters = ei_letter + sn_letter + tf_letter + jp_letter
    
    # Debug logging to help troubleshoot
    print(f"DEBUG: MBTI Calculation - E:{E} I:{I} S:{S} N:{N} T:{T} F:{F} J:{J} P:{P} -> {letters}")
    
    return letters
