"""
resume_parser.py
────────────────
Parses uploaded resumes and extracts structured information using Groq.
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from groq import Groq

# ──────────────────────────────────────────────────────────────────────────────
# ENV LOADING
# ──────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../../.env"))

load_dotenv(ENV_PATH)
load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")

_CLIENT = Groq(api_key=API_KEY)
_MODEL_PRIMARY = "openai/gpt-oss-120b"
_MODEL_FALLBACK = "openai/gpt-oss-120b"

_MAX_RESUME_CHARS = 8000

# ──────────────────────────────────────────────────────────────────────────────
# OPTIONAL DEPENDENCIES
# ──────────────────────────────────────────────────────────────────────────────

try:
    import pdfplumber
    _PDF_AVAILABLE = True
except ImportError:
    _PDF_AVAILABLE = False

try:
    from docx import Document as DocxDocument
    _DOCX_AVAILABLE = True
except ImportError:
    _DOCX_AVAILABLE = False

# ──────────────────────────────────────────────────────────────────────────────
# PROMPT
# ──────────────────────────────────────────────────────────────────────────────

_EXTRACTION_SYSTEM_PROMPT = """
You are an expert resume analyser.

Return STRICT VALID JSON ONLY.
Do not include explanation or markdown.

Schema:
{
  "candidate_name": "<string>",
  "skills": {},
  "projects": [],
  "domain_exposure": {},
  "weak_areas": [],
  "strong_areas": [],
  "resume_summary": "<summary>"
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# TEXT EXTRACTION
# ──────────────────────────────────────────────────────────────────────────────

def _extract_text_from_pdf(path: Path) -> str:
    if not _PDF_AVAILABLE:
        raise ImportError("Install pdfplumber")
    text = []
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages:
            t = p.extract_text()
            if t:
                text.append(t)
    return "\n".join(text)


def _extract_text_from_docx(path: Path) -> str:
    if not _DOCX_AVAILABLE:
        raise ImportError("Install python-docx")
    doc = DocxDocument(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _extract_raw_text(path: Path) -> str:
    if path.suffix == ".pdf":
        return _extract_text_from_pdf(path)
    elif path.suffix in [".docx", ".doc"]:
        return _extract_text_from_docx(path)
    elif path.suffix == ".txt":
        return path.read_text(errors="ignore")
    else:
        raise ValueError("Unsupported file format")

# ──────────────────────────────────────────────────────────────────────────────
# GROQ CALL
# ──────────────────────────────────────────────────────────────────────────────

def _extract_json_safe(text: str) -> dict:
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("Invalid JSON response")

    return json.loads(re.sub(r",\s*([}\]])", r"\1", match.group()))


def _groq_chat(messages, temperature=0.2, max_tokens=2048):
    # for attempt in range(3):
        # try:
    response = _CLIENT.chat.completions.create(
        model=_MODEL_PRIMARY,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content
        # except Exception:
        #     time.sleep(2 ** attempt)

    # fallback
    # response = _CLIENT.chat.completions.create(
    #     model=_MODEL_FALLBACK,
    #     messages=messages,
    #     temperature=temperature,
    #     max_tokens=max_tokens,
    # )
    # return response.choices[0].message.content


def _call_gemini(raw_text: str) -> dict[str, Any]:
    truncated = raw_text[:_MAX_RESUME_CHARS]

    messages = [
        {"role": "system", "content": _EXTRACTION_SYSTEM_PROMPT},
        {"role": "user", "content": truncated},
    ]

    content = _groq_chat(messages, temperature=0.2, max_tokens=2048)

    if not content:
        raise ValueError("Empty Groq response")

    return _extract_json_safe(content)

# ──────────────────────────────────────────────────────────────────────────────
# ENRICHMENT
# ──────────────────────────────────────────────────────────────────────────────

def _enrich(data: dict, raw_text: str) -> dict:
    data.setdefault("skills", {})
    data.setdefault("projects", [])
    data.setdefault("domain_exposure", {})
    data.setdefault("weak_areas", [])
    data.setdefault("strong_areas", [])
    data.setdefault("resume_summary", "")

    exp = data.get("total_experience_years", 0)
    if exp >= 2:
        data["suggested_difficulty"] = "hard"
    elif exp >= 0.5:
        data["suggested_difficulty"] = "medium"
    else:
        data["suggested_difficulty"] = "easy"

    data["_meta"] = {
        "words": len(raw_text.split()),
        "model": _MODEL_PRIMARY
    }

    return data

# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ──────────────────────────────────────────────────────────────────────────────

def parse_resume(file_path: str | Path) -> dict[str, Any]:
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError("File not found")

    raw_text = _extract_raw_text(path)

    if not raw_text.strip():
        raise ValueError("Empty resume")

    parsed = _call_gemini(raw_text)
    return _enrich(parsed, raw_text)


def parse_resume_from_text(raw_text: str) -> dict[str, Any]:
    if not raw_text.strip():
        raise ValueError("Empty text")

    parsed = _call_gemini(raw_text)
    return _enrich(parsed, raw_text)