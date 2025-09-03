from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_history, routes_questions, routes_answers, routes_events

# ---------- FASTAPI APP ----------
app = FastAPI(
    title="MindShift API with Groq",
    version="0.3.0",
    description="AI-powered productivity assistant with personality profiling 🚀"
)

# ---------- CORS ----------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
    "https://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MindShift API with Groq is running 🚀"}

# ---------- ROUTES ----------
app.include_router(routes_history.router, prefix="/history", tags=["History"])
app.include_router(routes_questions.router, prefix="/questions", tags=["Questions"])
app.include_router(routes_answers.router, prefix="/answers", tags=["Answers"])
app.include_router(routes_events.router, prefix="/events", tags=["Events"])
