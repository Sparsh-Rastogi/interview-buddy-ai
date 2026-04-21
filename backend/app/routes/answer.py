from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.redis_client import get_session, update_session
import httpx
from app.config import settings

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
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.MEMBER1_URL}/answer",
                json={
                    "session_id": body.session_id,
                    "answer": body.answer,
                    "state": ai_state
                }
            )
    except httpx.RequestError:
        raise HTTPException(status_code=500, detail="AI service unreachable")

    # 🔹 7. Check response status
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="AI service failed to process answer")

    data = response.json()

    # 🔹 8. Validate response structure (important)
    if "state" not in data or "status" not in data:
        raise HTTPException(status_code=500, detail="Invalid AI response")

    # 🔹 9. Update state
    session["ai_state"] = data.get("state", {})

    is_done = data.get("status") in ("ended", "closing")
    session["is_done"] = is_done

    # 🔹 10. Track questions safely
    if not is_done:
        session.setdefault("questions_asked", []).append(
            data.get("question", "")
        )

    # 🔹 11. Save session
    update_session(body.session_id, session)

    # 🔹 12. Return response
    return {
        "next_question": None if is_done else data.get("question", ""),
        "is_done": is_done
    }