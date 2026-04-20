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
# Health Check
# -----------------------------
@app.get("/api/health")
def health():
    return {"status": "sexy", "message": "Maza aaya"}

