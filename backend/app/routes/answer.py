from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.redis_client import get_session, update_session
import httpx
from app.config import settings
from app.ai.Interviewer import get_next_question

router = APIRouter()

class AnswerRequest(BaseModel):
    session_id: str
    answer: str


@router.post("/api/interview/answer")
async def submit_answer(body: AnswerRequest):
    # 🔹 1. Get session
    session = get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 🔹 2. Check if already finished
    if session.get("is_done"):
        return {"next_question": None, "is_done": True}

    # 🔹 3. Get AI state
    ai_state = session.get("ai_state")
    if not ai_state:
        raise HTTPException(status_code=400, detail="Interview not started yet")

    # 🔹 4. Ensure conversation exists (safe fallback)
    if "conversation" not in ai_state:
        print("⚠️ Missing conversation in AI state — recovering")
        ai_state["conversation"] = []

    # 🔹 5. Append user answer
    ai_state["conversation"].append({
        "role": "user",
        "content": body.answer
    })

    # 🔹 6. Call AI service safely
    try:
        result = get_next_question(
            session_id=body.session_id,
            candidate_answer=body.answer,
            session_state=ai_state
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    # 🔹 7. Check response status
    if not result:
        raise HTTPException(status_code=500, detail="Failed to start interview")

    # 🔹 8. Validate response structure (important)
    if "state" not in result or "status" not in result:
        raise HTTPException(status_code=500, detail="Invalid AI response")

    # 🔹 9. Update state
    session["ai_state"] = result.get("state", {})

    is_done = result.get("status") in ("ended", "closing")
    session["is_done"] = is_done

    # 🔹 10. Track questions safely
    if not is_done:
        session("questions_asked").append(
            result.get("question", "")
        )

    # 🔹 11. Save session
    update_session(body.session_id, session)

    # 🔹 12. Return response
    return {
        "next_question": None if is_done else result.get("question", ""),
        "is_done": is_done
    }