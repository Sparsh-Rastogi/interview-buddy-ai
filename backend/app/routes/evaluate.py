from fastapi import APIRouter, HTTPException
from app.utils.redis_client import get_session
from app.db.db import SessionLocal
from app.db import models
from app.utils.redis_client import get_session, update_session
from app.ai.Evaluator import evaluate_session
import traceback

router = APIRouter()


@router.get("/api/evaluation/{session_id}")
async def get_evaluation(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.get("is_done"):
        raise HTTPException(status_code=400, detail="Interview not completed yet")

    ai_state = session.get("ai_state")
    if not ai_state:
        raise HTTPException(status_code=500, detail="Missing AI state")

    # 🔹 Call AI service safely

    # Replace the entire httpx block with:
    try:
        data = evaluate_session(ai_state)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    if "overall_score" not in data:
        raise HTTPException(status_code=500, detail="Invalid AI response")

    # 🔹 Validate critical fields
    if "overall_score" not in data:
        raise HTTPException(status_code=500, detail="Invalid AI response")

    evaluation = {
        "overallScore": data.get("overall_score", 0),
        "dimensions": {
            "technical":      data.get("technical_score", 0),
            "problemSolving": data.get("problem_solving_score", 0),
            "communication":  data.get("communication_score", 0),
            "depth":          data.get("depth_score", 0),
            "clarity":        data.get("clarity_score", 0),
        },
        "feedback":  data.get("feedback", []),
        "mistakes":  data.get("mistakes", []),
        "strengths": data.get("strengths", [])
    }
    print(data)
    # 🔹 Safe DB handling
    db = SessionLocal()
    try:
        db_eval = models.Evaluation(
            session_id=session_id,
            score=evaluation["overallScore"],
            feedback=evaluation
        )
        db.add(db_eval)
        db.commit()
    finally:
        db.close()

    session["evaluation"] = data
    update_session(session_id, session)

    return {"evaluation": evaluation}