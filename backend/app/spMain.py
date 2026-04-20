from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict

app = FastAPI(
    title="AI Mock Interview Agent",
    description="Mock backend for testing API integration",
    version="1.0.0"
)

# CORS (frontend on localhost:8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# In-memory dummy store
# -----------------------------
session_counter: Dict[str, int] = {}

# -----------------------------
# Health Check
# -----------------------------
@app.get("/api/health")
def health():
    return {"status": "sexy", "message": "Maza aaya"}

# -----------------------------
# Resume Upload
# -----------------------------
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    return {
        "session_id": "dummy_session_123",
        "parsed_resume": {
            "name": "John Doe",
            "skills": ["Python", "FastAPI", "SQL"],
            "experience": ["2 years backend dev"]
        }
    }

# -----------------------------
# Start Interview
# -----------------------------

# @app.get("/api/interview/start")
# def start_fuck():
#     session_id = "5001"
#     return {
#         "session_id":session_id,
#         "first_question": "Tell me about yourself."
#     }

@app.post("/api/interview/start")
def start_interview(data: dict):
    session_id = data.get("session_id", "dummy_session_123")

    session_counter[session_id] = 0

    return {
        "session_id": session_id,
        "first_question": "Tell me about yourself."
    }

# -----------------------------
# Answer Question
# -----------------------------
@app.post("/api/interview/answer")
def answer_question(data: dict):
    session_id = data["session_id"]

    session_counter[session_id] = session_counter.get(session_id, 0) + 1

    count = session_counter[session_id]
    print(session_counter)

    if count >= 3:
        return {
            "next_question": None,
            "is_done": True
        }

    return {
        "next_question": f"Dummy question {count + 1}?",
        "is_done": False
    }

# -----------------------------
# End Interview
# -----------------------------
@app.post("/api/interview/end")
def end_interview(data: dict):
    session_id = "5001"
    print(f"Interview {session_id} ended successfully")
    return {
        "message": f"Interview {session_id} ended successfully"
    }

# -----------------------------
# Evaluation
# -----------------------------
@app.get("/api/evaluation/{session_id}")
def get_evaluation(session_id: str):
    return {
        "evaluation": {
            "overallScore": 8.2,
            "dimensions": {
                "technical": 8,
                "problemSolving": 7.5,
                "communication": 9,
                "depth": 8,
                "clarity": 8.5
            },
            "feedback": [
                {
                    "question": "Tell me about yourself",
                    "userAnswer": "Dummy answer",
                    "verdict": "Good",
                    "notes": "Well structured"
                }
            ],
            "mistakes": ["Missed edge cases"],
            "strengths": ["Clear communication"]
        }
    }

# -----------------------------
# Roadmap
# -----------------------------
@app.get("/api/roadmap/{session_id}")
def get_roadmap(session_id: str):
    return {
        "roadmap": [
            {
                "week": 1,
                "focus": "DSA Basics",
                "topics": ["Arrays", "Strings"],
                "problems": ["Two Sum", "Valid Anagram"]
            },
            {
                "week": 2,
                "focus": "Backend",
                "topics": ["APIs", "DB Design"],
                "problems": ["Design REST API"]
            }
        ]
    }