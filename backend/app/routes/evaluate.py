from fastapi import APIRouter, HTTPException
from app.utils.redis_client import get_session
from app.db.db import SessionLocal
from app.db import models
import json

router = APIRouter()

@router.get("/api/evaluation/{session_id}")
async def get_evaluation(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.get("is_done"):
        raise HTTPException(status_code=400, detail="Interview not completed yet")

    # TODO: Replace with Member 1's scorer
    # from ai_core.evaluation.scorer import score_answer
    # evaluation = score_answer(session)
    evaluation = {
        "overallScore": 75.0,
        "dimensions": {
            "technical":       70.0,
            "problemSolving":  75.0,
            "communication":   80.0,
            "depth":           70.0,
            "clarity":         80.0
        },
        "feedback": [
            {
                "question":   q,
                "userAnswer": "",
                "verdict":    "satisfactory",
                "notes":      "Placeholder — Member 1 will fill this"
            }
            for q in session.get("questions_asked", [])
        ],
        "mistakes":   [],
        "strengths":  session.get("strengths", [])
    }

    # Save evaluation to PostgreSQL
    db = SessionLocal()
    db_eval = models.Evaluation(
        session_id=session_id,
        score=evaluation["overallScore"],
        feedback=evaluation
    )
    db.add(db_eval)
    db.commit()
    db.close()

    return {"evaluation": evaluation}