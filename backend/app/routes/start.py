from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from app.utils.redis_client import get_session, update_session
from app.ai.Interviewer import start_session
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
        result = start_session(
            candidate_name=parsed_resume.get("name", "Candidate"),
            role_target=body.target_role,
            difficulty=body.difficulty,
            resume_data=parsed_resume,
            max_questions=body.num_questions,
            session_id=body.session_id
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    if not result:
        raise HTTPException(status_code=500, detail="Failed to start interview")


    session["ai_state"] = result.get("state", result)
    session["questions_asked"] = [result.get("question", "")]
    session["num_questions"] = body.num_questions
    session["is_done"] = False

    update_session(body.session_id, session)

    return {
        "session_id": body.session_id,
        "first_question": result.get("question", "")
    }