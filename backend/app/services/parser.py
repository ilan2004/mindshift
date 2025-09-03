def parse_chatgpt_history(raw_json_text: str) -> dict:
    """Mock parser: replace with real logic to scan conversations.
    Returns a summary dict used by question generator.
    """
    if not raw_json_text:
        return {"message_count": 0, "topics": []}
    # TODO: implement actual parsing
    return {"message_count": 42, "topics": ["productivity", "habits", "focus"]}
