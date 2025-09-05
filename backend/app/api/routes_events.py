from fastapi import APIRouter
from app.api.schemas import EventIn, RecommendationOut
from app.services.recommendation_service import generate_recommendations

router = APIRouter()

@router.post("/", response_model=RecommendationOut)
def log_event(payload: EventIn):
    recs = generate_recommendations(payload.event_type, payload.details)
    return {"user_id": payload.user_id, "recommendations": recs}
