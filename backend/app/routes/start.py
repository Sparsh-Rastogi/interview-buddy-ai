from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from app.utils.redis_client import get_session, update_session
import httpx
from app.config import settings

router = APIRouter()

# MEMBER1_URL = "http://localhost:8001"  # ← ask Member 1 what port they're running on

class StartRequest(BaseModel):
    session_id: str
    target_role: str
    difficulty: Literal["easy", "medium", "hard"]
    duration: int
    num_questions: int

@router.post("/api/interview/start")
async def start_interview(body: StartRequest):
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Upload resume first.")

    parsed_resume = session.get("parsed_resume", {})

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.MEMBER1_URL}/start",
                json={
                    "candidate_name": parsed_resume.get("name", "Candidate"),
                    "role_target": body.target_role,
                    "resume_data": parsed_resume
                }
            )
    except httpx.RequestError:
        raise HTTPException(status_code=500, detail="AI service unreachable")

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="AI service failed to start interview")

    data = response.json()

    session["ai_state"] = data.get("state", {})
    session["questions_asked"] = [data.get("question", "")]
    session["num_questions"] = body.num_questions
    session["is_done"] = False

    update_session(body.session_id, session)

    return {
        "session_id": body.session_id,
        "first_question": data.get("question", "")
    }