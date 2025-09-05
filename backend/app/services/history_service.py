import json
import os
from typing import List, Union, Dict, Tuple
from app.services.groq_service import (
    generate_questions_from_themes,
    generate_questions_with_prompt,
)


def load_chatgpt_history_from_file(path: str) -> List[Dict[str, str]]:
    """
    Parse ChatGPT export JSON (conversations.json) and extract a linear list of user messages.
    Returns a list of dicts: {"role": "user", "content": str}
    """
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return []

    messages: List[Dict[str, str]] = []
    if not isinstance(data, list):
        return messages

    for conv in data:
        mapping = conv.get("mapping", {}) if isinstance(conv, dict) else {}
        for node in mapping.values():
            msg = node.get("message") if isinstance(node, dict) else None
            if not msg:
                continue
            author = (msg.get("author") or {}).get("role")
            if author != "user":
                continue
            content = msg.get("content", {})
            parts = content.get("parts") if isinstance(content, dict) else None
            text = None
            if isinstance(parts, list) and parts:
                text = "\n".join([str(p) for p in parts if p is not None])
            if text:
                messages.append({"role": "user", "content": text})

    return messages


def extract_themes(chat_history: List[Union[dict, str]]) -> List[str]:
    """
    Extract coarse themes from messages for grounding.
    """
    themes = set()
    for msg in chat_history:
        if isinstance(msg, dict):
            if msg.get("role") != "user":
                continue
            content = msg.get("content", "").lower()
        else:
            content = str(msg).lower()

        if any(word in content for word in ["study", "exam", "learn", "read", "course"]):
            themes.add("study")
        if any(word in content for word in ["hobby", "hobbies", "project", "side project", "vlog", "youtube"]):
            themes.add("hobbies")
        if any(word in content for word in ["career", "job", "work", "profession", "clients", "startup"]):
            themes.add("career")
        if any(word in content for word in ["focus", "distraction", "procrastinate", "attention", "consistency"]):
            themes.add("focus")
        if any(word in content for word in ["travel", "trip", "friends", "fun", "adventure"]):
            themes.add("lifestyle")

    return list(themes)


def extract_mbti_axis_signals(chat_history: List[Union[dict, str]]) -> Dict[str, List[str]]:
    """
    Very lightweight keyword-based signal extraction per MBTI axis.
    Returns dict with keys: EI, SN, TF, JP mapping to example snippets/keywords.
    """
    axes = {"EI": [], "SN": [], "TF": [], "JP": []}

    def add(axis: str, snippet: str):
        if snippet and len(axes[axis]) < 6:
            axes[axis].append(snippet[:160])

    for msg in chat_history:
        if isinstance(msg, dict):
            if msg.get("role") != "user":
                continue
            content = msg.get("content", "")
        else:
            content = str(msg)

        low = content.lower()
        # E/I
        if any(k in low for k in ["friends", "party", "collaborate", "talk to", "team"]):
            add("EI", content)
        if any(k in low for k in ["alone", "solo", "quiet", "deep work", "recharge"]):
            add("EI", content)
        # S/N
        if any(k in low for k in ["details", "step-by-step", "practical", "examples"]):
            add("SN", content)
        if any(k in low for k in ["big picture", "vision", "ideas", "concepts"]):
            add("SN", content)
        # T/F
        if any(k in low for k in ["logic", "metrics", "optimize", "efficient"]):
            add("TF", content)
        if any(k in low for k in ["feel", "empathy", "values", "support"]):
            add("TF", content)
        # J/P
        if any(k in low for k in ["plan", "schedule", "deadline", "organized"]):
            add("JP", content)
        if any(k in low for k in ["spontaneous", "last-minute", "flexible", "explore"]):
            add("JP", content)

    return axes


def _summarize_user_context(chat_history: List[Union[dict, str]], max_chars: int = 900) -> str:
    """
    Build a compact context from user messages to ground the model.
    """
    buf: List[str] = []
    for msg in chat_history:
        if isinstance(msg, dict) and msg.get("role") == "user":
            text = str(msg.get("content", "")).strip()
        elif not isinstance(msg, dict):
            text = str(msg).strip()
        else:
            continue
        if text:
            buf.append(text)
        joined = " \n".join(buf)
        if len(joined) >= max_chars:
            return joined[:max_chars]
    return " \n".join(buf)[:max_chars]


def _build_enriched_prompt(themes: List[str], user_context: str, axes: Dict[str, List[str]]) -> str:
    """
    Construct a strict prompt to generate 10–15 first-person, situation-based statements
    that discriminate MBTI axes while staying grounded in user's own scenarios.
    """
    axes_str = (
        "E/I examples: " + "; ".join(axes.get("EI", [])) + "\n" +
        "S/N examples: " + "; ".join(axes.get("SN", [])) + "\n" +
        "T/F examples: " + "; ".join(axes.get("TF", [])) + "\n" +
        "J/P examples: " + "; ".join(axes.get("JP", []))
    )
    prompt = (
        "You are generating statements for a personality test focused on MBTI.\n"
        "Requirements:\n"
        "- ONLY first-person statements suitable for Agree/Disagree.\n"
        "- NO questions, NO numbering, NO bullets, NO commentary.\n"
        "- Use realistic, situation-based scenarios grounded in the user's own stories (explicitly weave their scenarios into the statements when natural).\n"
        "- COVER ALL AXES with EXACTLY 4 statements per axis (16 total):\n"
        "  [EI] lines 1–4 (Extraversion/Introversion)\n"
        "  [SN] lines 5–8 (Sensing/Intuition)\n"
        "  [TF] lines 9–12 (Thinking/Feeling)\n"
        "  [JP] lines 13–16 (Judging/Perceiving)\n"
        "- Prefix each line with the axis tag ([EI], [SN], [TF], or [JP]) followed by a space, then the statement.\n\n"
        f"User context (snippets):\n{user_context}\n\n"
        f"Themes to consider: {themes}\n"
        f"Signals by axis:\n{axes_str}\n\n"
        "Output exactly 16 lines, one per statement, each starting with a tag like [EI] or [SN]."
    )
    return prompt


def generate_questions(chat_history: List[Union[dict, str]]) -> List[Dict]:
    """
    Generate personalized first-person statements for Agree/Disagree answers
    prioritizing MBTI-discriminative, situation-based items grounded in the user's history.
    """
    questions: List[Dict] = []

    # 1) Enriched MBTI-focused generation path
    themes = extract_themes(chat_history)
    axes = extract_mbti_axis_signals(chat_history)
    user_ctx = _summarize_user_context(chat_history)
    if user_ctx:
        prompt = _build_enriched_prompt(themes, user_ctx, axes)
        enriched_lines = generate_questions_with_prompt(prompt)

        # Parse axis tags and enforce exactly 4 statements per axis
        buckets = {"EI": [], "SN": [], "TF": [], "JP": []}
        for ln in enriched_lines or []:
            stripped = ln.strip()
            tag = None
            if stripped.startswith("[EI]"):
                tag = "EI"; text = stripped[4:].strip()
            elif stripped.startswith("[SN]"):
                tag = "SN"; text = stripped[4:].strip()
            elif stripped.startswith("[TF]"):
                tag = "TF"; text = stripped[4:].strip()
            elif stripped.startswith("[JP]"):
                tag = "JP"; text = stripped[4:].strip()
            else:
                # No tag: try to infer later; keep as uncategorized
                tag = None; text = stripped
            if tag in buckets and text:
                if text.endswith('.'):
                    buckets[tag].append(text)
                else:
                    buckets[tag].append(text + ".")

        # Simple scenario-aware fillers if needed
        def fill_for_axis(axis: str, need: int):
            fillers = []
            lowctx = user_ctx.lower()
            has_trip = any(k in lowctx for k in ["trip", "travel", "friends", "bali", "lombok", "nusa penida"])
            if axis == "EI":
                if has_trip: fillers += [
                    "On a trip with friends, I feel energized by making plans together and leading the vibe.",
                    "When traveling with a group, I naturally start conversations and bring people together.",
                ]
                fillers += [
                    "I recharge best by spending time alone after a busy social day.",
                    "I prefer a quiet evening to reset rather than going out again.",
                ]
            elif axis == "SN":
                if has_trip: fillers += [
                    "While planning a getaway, I look for concrete details like routes, budgets, and checklists.",
                    "When choosing destinations, I focus on the big-picture vibe and unique stories of the place.",
                ]
                fillers += [
                    "I am drawn to practical steps and proven methods before experimenting.",
                    "I get excited by patterns and possibilities more than step-by-step instructions.",
                ]
            elif axis == "TF":
                if has_trip: fillers += [
                    "If plans change during a trip, I decide based on efficiency and trade-offs.",
                    "In group decisions, I weigh how people will feel before making a call.",
                ]
                fillers += [
                    "I justify choices with metrics and logic even in everyday situations.",
                    "I prioritize harmony and values when outcomes affect people I care about.",
                ]
            elif axis == "JP":
                if has_trip: fillers += [
                    "For travel, I like having an itinerary and sticking to a schedule.",
                    "I prefer leaving space for spontaneous detours when exploring a new place.",
                ]
                fillers += [
                    "I feel calm when I have clear plans and deadlines for the week.",
                    "I like to stay flexible and adapt plans as new opportunities appear.",
                ]
            # Dedup and trim
            seen = set()
            out = []
            for s in fillers:
                if s not in seen:
                    seen.add(s)
                    out.append(s if s.endswith('.') else s + ".")
                if len(out) >= need:
                    break
            return out

        # Ensure exactly 4 per axis (total 16). Fill deficits up to 4 with scenario-aware lines.
        final_lines: List[str] = []
        for axis_key in ["EI", "SN", "TF", "JP"]:
            items = buckets[axis_key][:4]
            if len(items) < 4:
                items += fill_for_axis(axis_key, 4 - len(items))
            items = items[:4]
            final_lines.extend(items)

        # Use enriched result unconditionally (exactly 16, possibly with fillers)
        if sum(1 for s in final_lines if s) == 16:
            questions = [{"question": s, "options": ["Agree", "Disagree"]} for s in final_lines]

    # 2) Fallback: simple themes-based generation
    if not questions and themes:
        raw_statements = generate_questions_from_themes(themes)
        for stmt in raw_statements:
            questions.append({"question": stmt, "options": ["Agree", "Disagree"]})

    # 3) Fallback: static bank
    if not questions:
        fallback_bank = {
            "study": [
                "I feel most focused for studying in the morning.",
                "I usually decide what to study first based on urgency.",
                "I take a short break when my concentration fades.",
            ],
            "focus": [
                "I easily get distracted by my phone or social media.",
                "I can maintain deep focus for long periods without interruption.",
                "The environment greatly affects my concentration.",
            ],
            "career": [
                "I have a clear top priority for my work each week.",
                "I focus on tasks that create the most impact first.",
                "I feel blocked in my current project by specific obstacles.",
            ],
            "hobbies": [
                "I actively make time for my hobbies during busy weeks.",
                "Certain hobbies energize me more than others.",
                "I take small steps daily to progress on personal projects.",
            ],
            "lifestyle": [
                "I prefer spontaneous plans with friends over sticking to schedules.",
                "I seek new experiences even if they disrupt my routine.",
                "Planning a trip excites me more than following a strict itinerary.",
            ],
        }

        seen = set()
        for t in themes or []:
            for q in fallback_bank.get(t, []):
                if q not in seen:
                    seen.add(q)
                    questions.append({"question": q, "options": ["Agree", "Disagree"]})

        # Minimal default statements
        if not questions:
            questions = [
                {"question": "I can make the next hour productive if I focus properly.", "options": ["Agree", "Disagree"]},
                {"question": "I can identify and remove at least one distraction before starting.", "options": ["Agree", "Disagree"]},
                {"question": "I can take a small next step toward a goal right now.", "options": ["Agree", "Disagree"]},
            ]

    return questions
