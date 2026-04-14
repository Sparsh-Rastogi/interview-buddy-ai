from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.redis_client import get_session, update_session

router = APIRouter()

class EndRequest(BaseModel):
    session_id: str

@router.post("/api/interview/end")
async def end_interview(body: EndRequest):
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["is_done"] = True
    update_session(body.session_id, session)

    return {"message": "Interview ended successfully"}