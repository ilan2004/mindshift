from typing import List, Dict


def assign_profile(answers: List[Dict]) -> Dict:
    """Very simple mock: averages values if present and returns a profile name."""
    numeric = [a.get("value") for a in answers if isinstance(a.get("value"), (int, float))]
    avg = sum(numeric) / len(numeric) if numeric else 3
    if avg >= 4:
        profile = "Achiever"
    elif avg >= 3:
        profile = "Analyst"
    else:
        profile = "Explorer"
    return {"type": profile, "score": avg}
