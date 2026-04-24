"""
evaluator.py
────────────
Groq-based interview evaluator (production-ready).
"""

from __future__ import annotations

import json
import os
import re
import time
from typing import Any

from dotenv import load_dotenv
from groq import Groq

from app.ai.prompts import get_evaluation_system_prompt

# ──────────────────────────────────────────────────────────────────────────────
# Load environment variables
# ──────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../../.env"))

load_dotenv(ENV_PATH)

API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError("GROQ_API_KEY not found. Check your .env file.")

# ──────────────────────────────────────────────────────────────────────────────
# Groq Client
# ──────────────────────────────────────────────────────────────────────────────

_CLIENT = Groq(api_key=API_KEY)
_MODEL_PRIMARY = "llama3-70b-8192"
_MODEL_FALLBACK = "llama3-8b-8192"

# ──────────────────────────────────────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────────────────────────────────────

_SCORE_WEIGHTS = {
    "technical_knowledge":    0.30,
    "problem_solving":        0.25,
    "communication":          0.15,
    "depth_of_understanding": 0.20,
    "code_quality":           0.05,
    "behavioral_competency":  0.05,
}

_GRADE_THRESHOLDS = [
    (9.0, "A+"),
    (8.0, "A"),
    (7.0, "B+"),
    (6.0, "B"),
    (5.0, "C"),
    (4.0, "D"),
    (0.0, "F"),
]

_HIRE_THRESHOLDS = [
    (8.5, "Strong Hire"),
    (7.0, "Hire"),
    (5.5, "Borderline"),
    (0.0, "No Hire"),
]

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _compute_overall_score(scores: dict[str, int]) -> float:
    total_weight = 0.0
    weighted_sum = 0.0
    for dim, weight in _SCORE_WEIGHTS.items():
        val = scores.get(dim, 0)
        weighted_sum += val * weight
        total_weight += weight
    return round(weighted_sum / total_weight, 2) if total_weight > 0 else 0.0


def _score_to_grade(score: float) -> str:
    for threshold, grade in _GRADE_THRESHOLDS:
        if score >= threshold:
            return grade
    return "F"


def _score_to_hire_recommendation(score: float) -> str:
    for threshold, rec in _HIRE_THRESHOLDS:
        if score >= threshold:
            return rec
    return "No Hire"


def _build_transcript(conversation: list[dict]) -> str:
    lines = []
    for msg in conversation:
        role = "INTERVIEWER" if msg["role"] == "assistant" else "CANDIDATE"
        content = re.sub(r"\[INTERNAL:.*?\]", "", msg["content"]).strip()
        if content:
            lines.append(f"{role}: {content}")
    return "\n\n".join(lines)


def _extract_json(text: str) -> dict:
    text = text.strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"No valid JSON found in model response:\n{text}")

    return json.loads(match.group())

# ──────────────────────────────────────────────────────────────────────────────
# Groq Call (kept function name SAME)
# ──────────────────────────────────────────────────────────────────────────────

def _groq_chat(messages, temperature=0.2, max_tokens=1024):
    for attempt in range(3):
        try:
            response = _CLIENT.chat.completions.create(
                model=_MODEL_PRIMARY,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content

        except Exception:
            time.sleep(2 ** attempt)

    # fallback model
    response = _CLIENT.chat.completions.create(
        model=_MODEL_FALLBACK,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def _call_gemini(transcript: str, metadata: dict) -> dict[str, Any]:
    candidate_name = metadata.get("candidate_name", "Candidate")
    role_target = metadata.get("role_target", "SDE")
    difficulty = metadata.get("difficulty", "medium")
    domains = metadata.get("domains", [])

    user_content = f"""
Evaluate the following interview transcript.

INTERVIEW METADATA:
- Candidate   : {candidate_name}
- Role target : {role_target}
- Difficulty  : {difficulty}
- Domains     : {', '.join(domains)}

TRANSCRIPT:
{'-' * 60}
{transcript}
{'-' * 60}

Return ONLY valid JSON.
"""

    messages = [
        {"role": "system", "content": get_evaluation_system_prompt()},
        {"role": "user", "content": user_content},
    ]

    content = _groq_chat(messages, temperature=0.2, max_tokens=2048)

    if not content:
        raise ValueError("Empty response from Groq")

    return _extract_json(content)

# ──────────────────────────────────────────────────────────────────────────────
# Post Processing
# ──────────────────────────────────────────────────────────────────────────────

def _post_process_evaluation(result: dict[str, Any], session_state: dict[str, Any]) -> dict[str, Any]:
    defaults = {
        "scores": {},
        "overall_score": 0.0,
        "grade": "F",
        "strengths": [],
        "weaknesses": [],
        "weak_areas": [],
        "domain_scores": {},
        "detailed_feedback": "",
        "hire_recommendation": "No Hire",
    }

    for key, val in defaults.items():
        result.setdefault(key, val)

    scores = result.get("scores", {})
    overall = _compute_overall_score(scores)

    result["overall_score"] = overall
    result["grade"] = _score_to_grade(overall)
    result["hire_recommendation"] = _score_to_hire_recommendation(overall)

    for dim in scores:
        scores[dim] = max(0, min(10, int(scores[dim])))

    result["_meta"] = {
        "session_id": session_state.get("session_id"),
        "candidate_name": session_state.get("candidate_name"),
        "role_target": session_state.get("role_target"),
        "difficulty": session_state.get("difficulty"),
        "total_questions": session_state.get("question_count", 0),
        "elapsed_seconds": int(time.time() - session_state.get("started_at", time.time())),
        "evaluated_at": int(time.time()),
        "model": _MODEL_PRIMARY,
    }

    heuristic_domain_scores = session_state.get("domain_scores", {})
    for domain, scores_list in heuristic_domain_scores.items():
        if scores_list and domain not in result["domain_scores"]:
            result["domain_scores"][domain] = round(sum(scores_list) / len(scores_list), 1)

    return result

# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def evaluate_session(session_state: dict[str, Any]) -> dict[str, Any]:
    conversation = session_state.get("conversation", [])
    if not conversation:
        raise ValueError("Session has no conversation")

    transcript = _build_transcript(conversation)

    if len(transcript.strip()) < 50:
        raise ValueError("Transcript too short")

    metadata = {
        "candidate_name": session_state.get("candidate_name", "Candidate"),
        "role_target": session_state.get("role_target", "SDE"),
        "difficulty": session_state.get("difficulty", "medium"),
        "domains": session_state.get("domains", []),
    }

    raw = _call_gemini(transcript, metadata)
    return _post_process_evaluation(raw, session_state)


def evaluate_single_answer(
    question: str,
    answer: str,
    domain: str = "DSA",
    difficulty: str = "medium",
) -> dict[str, Any]:

    system_prompt = """
You are a technical interview evaluator.

Return ONLY valid JSON:
{
  "score": <0-10>,
  "verdict": "<Excellent|Good|Average|Poor>",
  "feedback": "<short feedback>",
  "follow_up": "<next question>"
}
"""

    user_content = f"""
DOMAIN: {domain}
DIFFICULTY: {difficulty}

QUESTION: {question}
ANSWER: {answer}
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    content = _groq_chat(messages, temperature=0.3, max_tokens=300)

    if not content:
        raise ValueError("Empty response from Groq")

    result = _extract_json(content)
    result["score"] = max(0, min(10, int(result.get("score", 0))))

    return result