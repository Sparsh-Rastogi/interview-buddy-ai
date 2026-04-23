from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.db import Base, engine

import os

import logging
logging.basicConfig(level=logging.ERROR)

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Mock Interview Agent",
    description="Backend API for intelligent mock interview system",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Health Check
@app.get("/api/health")
def health():
    return {"status": "sexy", "message": "Maza aaya"}

