from typing import Dict, List
import json
from pathlib import Path

# Load personality data safely
DATA_PATH = Path("app/data/personalities.json")
try:
    PERSONALITY_DATA = json.loads(DATA_PATH.read_text())
except Exception as e:
    print(f"Error loading personality data: {e}")
    PERSONALITY_DATA = []

def generate_recommendations(
    event_type: str, 
    details: Dict[str, str], 
    user_traits: List[str] = None
) -> List[str]:
    """
    Generate personalized recommendations based on user events and traits.
    Supports hybrid traits and ensures fallback tips are always returned.
    """
    if user_traits is None:
        user_traits = []

    tips = []

    # Normalize trait comparison (case-insensitive)
    normalized_traits = [t.lower() for t in user_traits]

    for trait_data in PERSONALITY_DATA:
        trait_name = trait_data.get("trait", "").lower()
        if trait_name in normalized_traits:
            if event_type == "distraction":
                tips.extend(trait_data.get("dopamine_boosters", []))
            elif event_type == "streak_success":
                tips.extend(trait_data.get("motivation_hooks", []))
            elif event_type == "streak_break":
                tips.extend(trait_data.get("demotivation_hooks", []))

    # Provide fallback tips if none found
    if not tips:
        fallback_map = {
            "distraction": [
                "Take a deep breath and refocus.",
                "Try a 5-minute stretch instead of scrolling."
            ],
            "streak_success": ["Awesome job! Keep building momentum 🚀"],
            "streak_break": ["Don’t worry, tomorrow is a new start 💪"]
        }
        tips = fallback_map.get(event_type, ["Stay mindful and keep progressing!"])

    # Remove duplicates
    return list(set(tips))
