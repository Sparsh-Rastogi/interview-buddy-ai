from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.redis_client import get_session, update_session
from typing import Literal

router = APIRouter()

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

    # Store interview settings in session
    session["target_role"]    = body.target_role
    session["difficulty"]     = body.difficulty
    session["duration"]       = body.duration
    session["num_questions"]  = body.num_questions
    session["questions_asked_count"] = 0

    # TODO: Replace this with Member 1's generate_question()
    # from ai_core.interview.question_generator import generate_question
    # first_question = generate_question(session["parsed_resume"], body.difficulty)
    first_question = f"Tell me about yourself and your experience relevant to the {body.target_role} role."

    session["history"].append({
        "role": "assistant",
        "content": first_question
    })
    session["questions_asked"].append(first_question)
    session["questions_asked_count"] += 1

    update_session(body.session_id, session)

    return {
        "session_id": body.session_id,
        "first_question": first_question
    }