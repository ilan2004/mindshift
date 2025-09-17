from typing import List, Dict

# ---------- 24-item MBTI Questions (matches frontend) ----------
STATIC_QUESTIONS = [
    # E vs I (6)
    # E-leaning (agree => E)
    "You gain energy from being around people and external activity.",
    "You prefer discussing ideas out loud rather than reflecting silently.",
    "You are quick to engage and speak up in group settings.",
    # I-leaning (agree => I)
    "You feel refreshed after spending time alone with your thoughts.",
    "You often think through an idea fully before sharing it.",
    "You prefer a few close friends over a wide circle of acquaintances.",

    # S vs N (6)
    # S-leaning (agree => S)
    "You rely on concrete facts and past experience when solving problems.",
    "You are attentive to practical details in day-to-day tasks.",
    "You prefer step-by-step instructions over open-ended exploration.",
    # N-leaning (agree => N)
    "You're drawn to patterns, possibilities, and big-picture connections.",
    "You enjoy brainstorming novel ideas and future scenarios.",
    "You often interpret information beyond what is explicitly stated.",

    # T vs F (6)
    # T-leaning (agree => T)
    "You prioritize objective criteria over personal values when deciding.",
    "You feel comfortable giving candid, critical feedback when needed.",
    "In debates, you value accuracy more than maintaining harmony.",
    # F-leaning (agree => F)
    "You consider the impact on people as much as the logic of a decision.",
    "You strive to create consensus and preserve relationships.",
    "You tend to empathize and see multiple personal perspectives.",

    # J vs P (6)
    # J-leaning (agree => J)
    "You like to plan ahead and close decisions rather than keep options open.",
    "You feel satisfied when tasks are completed well before deadlines.",
    "You prefer clear structure, schedules, and defined expectations.",
    # P-leaning (agree => P)
    "You enjoy keeping options open and adapting plans as things change.",
    "You're productive in flexible, spontaneous bursts rather than steady routines.",
    "You're comfortable starting before everything is fully defined.",
]

def get_static_questions() -> List[Dict]:
    """
    Returns the ready-made MBTI questions structured with answer options.
    """
    return [{"question": q, "options": ["Agree", "Disagree"]} for q in STATIC_QUESTIONS]
