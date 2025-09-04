from typing import List, Dict

# ---------- Ready-made 16 MBTI Questions ----------
STATIC_QUESTIONS = [
    # Extraversion (E) vs Introversion (I)
    "You gain energy more from being with people than spending time alone.",
    "You feel comfortable walking up to a stranger and starting a conversation.",
    "You enjoy participating in team-based activities more than solitary ones.",
    "At social gatherings, you usually wait for others to approach you first.",  # reverse polarity

    # Sensing (S) vs Intuition (N)
    "You trust facts and details more than abstract theories.",
    "Complex and novel ideas excite you more than simple and straightforward ones.",
    "You prefer practical discussions over highly theoretical ones.",
    "You enjoy exploring unfamiliar ideas and future possibilities.",

    # Thinking (T) vs Feeling (F)
    "You prioritize logic and fairness over personal feelings when making decisions.",
    "People’s stories and emotions speak louder to you than numbers or data.",
    "In disagreements, you focus more on proving your point than preserving harmony.",
    "You usually find yourself following your heart rather than pure facts.",

    # Judging (J) vs Perceiving (P)
    "You like to have your day planned out with lists and schedules.",
    "You often allow the day to unfold without any fixed plan.",
    "You prefer to finish tasks well before the deadline.",
    "Your work style is closer to spontaneous bursts of energy than consistent routines.",
]

def get_static_questions() -> List[Dict]:
    """
    Returns the ready-made MBTI questions structured with answer options.
    """
    return [{"question": q, "options": ["Agree", "Disagree"]} for q in STATIC_QUESTIONS]
