from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.redis_client import save_session
from app.db.db import SessionLocal
from app.db import models
import pdfplumber
import uuid
import io

router = APIRouter()

@router.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        # Read and parse PDF
        contents = await file.read()
        parsed = parse_pdf(contents)

        # Create session ID
        session_id = str(uuid.uuid4())

        # Save session to Redis
        save_session(session_id, {
            "parsed_resume": parsed,
            "history": [],
            "questions_asked": [],
            "strengths": [],
            "weaknesses": [],
            "is_done": False
        })

        # Save session to PostgreSQL
        db = SessionLocal()
        db_session = models.Session(id=session_id)
        db.add(db_session)
        db.commit()
        db.close()

        return {
            "session_id": session_id,
            "parsed_resume": parsed
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def parse_pdf(contents: bytes) -> dict:
    text = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    # Basic extraction — Member 1 will replace this
    # with their advanced parser once integrated
    lines = text.split("\n")
    name = lines[0].strip() if lines else None

    skills = []
    experience = []

    for line in lines:
        lower = line.lower()
        if any(skill in lower for skill in [
            "python", "javascript", "react", "node", "sql",
            "java", "c++", "machine learning", "fastapi", "django"
        ]):
            skills.append(line.strip())
        if any(word in lower for word in ["intern", "engineer", "developer", "worked", "built"]):
            experience.append(line.strip())

    return {
        "name": name,
        "raw_text": text,
        "skills": list(set(skills)),
        "experience": experience
    }