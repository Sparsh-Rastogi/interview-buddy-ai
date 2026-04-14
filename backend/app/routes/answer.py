from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.redis_client import get_session, update_session

router = APIRouter()

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

@router.post("/api/interview/answer")
async def submit_answer(body: AnswerRequest):
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.get("is_done"):
        return {"next_question": None, "is_done": True}

    # Add user answer to history
    session["history"].append({
        "role": "user",
        "content": body.answer
    })

    # Check if interview is complete
    asked  = session.get("questions_asked_count", 0)
    total  = session.get("num_questions", 5)

    if asked >= total:
        session["is_done"] = True
        update_session(body.session_id, session)
        return {"next_question": None, "is_done": True}

    # TODO: Replace with Member 1's cross_question / flow_manager
    # from ai_core.interview.cross_question import generate_followup
    # next_q = generate_followup(session)
    next_q = f"Good. Can you elaborate more on that? Question {asked + 1} of {total}."

    session["history"].append({
        "role": "assistant",
        "content": next_q
    })
    session["questions_asked"].append(next_q)
    session["questions_asked_count"] += 1

    update_session(body.session_id, session)

    return {
        "next_question": next_q,
        "is_done": False
    }