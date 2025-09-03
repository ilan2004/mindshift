# API Contract (Initial)

Base URL: Backend service (dev): http://localhost:8000/api

## Health
- GET /health -> { status: "ok" }

## Generate Questions
- POST /questions/generate
Request:
```json
{ "history_text": "string" }
```
Response:
```json
{ "questions": [ {"id":"q1","text":"...","scale": {"min":1,"max":5,"labels":["a","b"]} } ] }
```

## Assign Profile
- POST /profile/assign
Request:
```json
{ "answers": [ {"question_id":"q1","value":3} ] }
```
Response:
```json
{ "profile": { "type": "Analyst", "score": 3.2 } }
```

## Leaderboard (to be implemented)
- GET /leaderboard -> [{ id, name, points, streak }]
