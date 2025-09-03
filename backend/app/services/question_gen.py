from typing import List, Dict


def generate_questions(history_text: str) -> List[Dict]:
    """Generate mock personalized questions from history text.
    Replace with LLM-powered generation.
    """
    base = [
        {
            "id": "q1",
            "text": "On a typical day, how often do you switch tasks due to notifications?",
            "scale": {"min": 1, "max": 5, "labels": ["Never", "Always"]},
        },
        {
            "id": "q2",
            "text": "What motivates you more: competition or personal goals?",
            "options": ["Competition", "Personal Goals", "Both", "Neither"],
        },
        {
            "id": "q3",
            "text": "Do deadlines increase your focus?",
            "scale": {"min": 1, "max": 5, "labels": ["Not at all", "Very much"]},
        },
    ]
    # could tailor based on history_text length/keywords later
    return base
