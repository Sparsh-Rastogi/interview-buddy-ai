from fastapi import APIRouter, HTTPException
from app.utils.redis_client import get_session
from app.config import settings
import httpx

router = APIRouter()


@router.get("/api/roadmap/{session_id}")
async def get_roadmap(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 🔹 Ensure interview is completed
    if not session.get("is_done"):
        raise HTTPException(status_code=400, detail="Interview not completed yet")

    ai_state = session.get("ai_state")
    if not ai_state:
        raise HTTPException(status_code=500, detail="Missing AI state")

    # 🔹 Call AI safely
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.MEMBER1_URL}/roadmap",
                json={"state": ai_state}
            )
    except httpx.RequestError:
        raise HTTPException(status_code=500, detail="AI service unreachable")

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="AI service failed to generate roadmap")

    data = response.json()

    # 🔹 Validate response
    if "roadmap" not in data:
        raise HTTPException(status_code=500, detail="Invalid AI response")

    return {
        "roadmap": data.get("roadmap", [])
    }