from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.db import Base, engine
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Mock Interview Agent",
    description="Backend API for intelligent mock interview system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Routes
from app.routes import upload, start, answer, interview, evaluate, roadmap
app.include_router(upload.router)
app.include_router(start.router)
app.include_router(answer.router)
app.include_router(interview.router)
app.include_router(evaluate.router)
app.include_router(roadmap.router)

@app.get("/api/health")
def health():
    return {"status": "sexy", "message": "Maza aaya"}