from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, questions, profile

app = FastAPI(title="MindShift Backend", version="0.1.0")

# Allow local dev origins; tighten for prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/")
def root():
    return {"name": "MindShift Backend", "status": "ok"}
