from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.db import Base, engine
import os

# Create all DB tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Mock Interview Agent",
    description="Backend API for intelligent mock interview system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Server is running"}