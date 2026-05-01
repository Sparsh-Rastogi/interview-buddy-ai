"""
evaluator.py
────────────
Groq-based interview evaluator (robust + less strict + no zero-score bug)
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
# ENV
# ──────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../../.env"))

load_dotenv(ENV_PATH)

API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError("GROQ_API_KEY not found.")

# ──────────────────────────────────────────────────────────────────────────────
# CLIENT
# ──────────────────────────────────────────────────────────────────────────────

_CLIENT = Groq(api_key=API_KEY)
_MODEL_PRIMARY = "openai/gpt-oss-120b"
_MODEL_FALLBACK = "openai/gpt-oss-120b"

# ──────────────────────────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────────────────────────

_SCORE_WEIGHTS = {
    "technical_knowledge":    0.30,
    "problem_solving":        0.25,
    "communication":          0.15,
    "depth_of_understanding": 0.20,
    "code_quality":           0.05,
    "behavioral_competency":  0.05,
}

_HIRE_THRESHOLDS = [
    (8.5, "Strong Hire"),
    (7.0, "Hire"),
    (5.5, "Borderline"),
    (0.0, "No Hire"),
]

# ──────────────────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def _normalize_score_keys(scores: dict) -> dict:
    mapping = {
        "technical": "technical_knowledge",
        "technicalKnowledge": "technical_knowledge",
        "problemSolving": "problem_solving",
        "problem-solving": "problem_solving",
        "communication_skills": "communication",
        "depth": "depth_of_understanding",
        "understanding": "depth_of_understanding",
        "code": "code_quality",
        "behavior": "behavioral_competency",
    }

    normalized = {}
    for k, v in scores.items():
        normalized[mapping.get(k, k)] = v

    return normalized


def _compute_overall_score(scores: dict[str, float]) -> float:
    total_weight = 0.0
    weighted_sum = 0.0
    values = []

    for dim, weight in _SCORE_WEIGHTS.items():
        val = float(scores.get(dim, 0))
        values.append(val)
        weighted_sum += val * weight
        total_weight += weight

    if total_weight == 0:
        return 0.0

    raw = weighted_sum / total_weight

    # smoothing
    mean_score = sum(values) / len(values) if values else 0
    smooth = 0.85 * raw + 0.15 * mean_score

    return round(smooth, 2)


def _score_to_grade(score: float) -> str:
    if score >= 9:
        return "A+"
    elif score >= 8:
        return "A"
    elif score >= 7:
        return "B+"
    elif score >= 6:
        return "B"
    elif score >= 5:
        return "C"
    elif score >= 4:
        return "D"
    else:
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
        raise ValueError(f"No valid JSON found:\n{text}")
    return json.loads(match.group())

# ──────────────────────────────────────────────────────────────────────────────
# GROQ CALL
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

    response = _CLIENT.chat.completions.create(
        model=_MODEL_FALLBACK,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def _call_gemini(transcript: str, metadata: dict[str, Any]) -> dict[str, Any]:
    user_content = f"""
Evaluate interview.

Candidate: {metadata.get("candidate_name")}
Role: {metadata.get("role_target")}
Difficulty: {metadata.get("difficulty")}
Domains: {', '.join(metadata.get("domains", []))}

TRANSCRIPT:
{transcript}

Return ONLY JSON with 'scores'.
"""

    messages = [
        {"role": "system", "content": get_evaluation_system_prompt()},
        {"role": "user", "content": user_content},
    ]

    content = _groq_chat(messages, temperature=0.3, max_tokens=2048)
    return _extract_json(content)

# ──────────────────────────────────────────────────────────────────────────────
# POST PROCESSING (FIXED)
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

    for k, v in defaults.items():
        result.setdefault(k, v)

    scores = result.get("scores")

    # fallback if missing
    if not isinstance(scores, dict) or not scores:
        scores = {}

    scores = _normalize_score_keys(scores)
    print(scores)

    # fill missing dims
    for dim in _SCORE_WEIGHTS:
        if dim not in scores:
            scores[dim] = 5.0

    # sanitize + smooth
    clean_scores = {}
    for dim in _SCORE_WEIGHTS:
        try:
            val = float(scores[dim])
        except:
            val = 5.0

        val = max(0.0, min(10.0, val))
        val = 0.9 * val + 0.1 * 5

        clean_scores[dim] = round(val, 2)

    scores = clean_scores

    overall = _compute_overall_score(scores)

    result["scores"] = scores
    result["overall_score"] = overall
    result["grade"] = _score_to_grade(overall)
    result["hire_recommendation"] = _score_to_hire_recommendation(overall)

    return result

# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ──────────────────────────────────────────────────────────────────────────────

def evaluate_session(session_state: dict[str, Any]) -> dict[str, Any]:
    conversation = session_state.get("conversation", [])
    if not conversation:
        raise ValueError("No conversation")

    transcript = _build_transcript(conversation)
    raw = _call_gemini(transcript, session_state)

    return _post_process_evaluation(raw, session_state)


def evaluate_single_answer(question, answer, domain="DSA", difficulty="medium"):

    messages = [
        {"role": "system", "content": "Evaluate and return JSON with score (0-10)."},
        {"role": "user", "content": f"Q: {question}\nA: {answer}"}
    ]

    result = _extract_json(_groq_chat(messages))

    raw = float(result.get("score", 0))
    raw = max(0.0, min(10.0, raw))

    score = 0.9 * raw + 0.1 * 5

    result["score"] = round(score, 2)

    return result