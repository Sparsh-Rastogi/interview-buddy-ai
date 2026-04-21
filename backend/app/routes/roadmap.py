from fastapi import APIRouter, HTTPException
from app.utils.redis_client import get_session
from app.ai.Roadmap import generate_roadmap

router = APIRouter()

@router.get("/api/roadmap/{session_id}")
async def get_roadmap(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.get("is_done"):
        raise HTTPException(status_code=400, detail="Interview not completed yet")

    evaluation = session.get("evaluation")
    if not evaluation:
        raise HTTPException(status_code=400, detail="Get evaluation first before roadmap")

    try:
        data = generate_roadmap(evaluation)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    if not data or "roadmap" not in data:
        raise HTTPException(status_code=500, detail="Invalid roadmap response")

    return {"roadmap": data.get("roadmap", [])}