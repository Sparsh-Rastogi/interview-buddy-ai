from fastapi import APIRouter, HTTPException
from app.utils.redis_client import get_session

router = APIRouter()

@router.get("/api/roadmap/{session_id}")
async def get_roadmap(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # TODO: Replace with Member 1's generator
    # from ai_core.roadmap.generator import generate_roadmap
    # roadmap = generate_roadmap(session)
    roadmap = [
        {
            "week": 1,
            "focus": "Data Structures & Algorithms",
            "topics": ["Arrays", "Linked Lists", "Binary Search"],
            "problems": ["Two Sum", "Reverse Linked List", "Binary Search"]
        },
        {
            "week": 2,
            "focus": "Core CS Subjects",
            "topics": ["OS basics", "DBMS", "Computer Networks"],
            "problems": ["Deadlock scenarios", "SQL joins", "TCP vs UDP"]
        }
    ]

    return {"roadmap": roadmap}