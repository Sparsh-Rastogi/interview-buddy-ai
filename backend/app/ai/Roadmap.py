"""
roadmap.py
──────────
Generates a personalised study roadmap using Gemini.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from google import genai

from app.ai.prompts import get_roadmap_system_prompt

# ──────────────────────────────────────────────────────────────────────────────
# ENV LOADING
# ──────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../../.env"))

load_dotenv(ENV_PATH)
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

_CLIENT = genai.Client(api_key=API_KEY)
_MODEL = "gemini-2.5-flash"

# ──────────────────────────────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────────────────────────────

_WEEKS_BY_GRADE = {
    "A+": 4, "A": 4,
    "B+": 6, "B": 8,
    "C": 10,
    "D": 12, "F": 12,
}

_HOURS_BY_GRADE = {
    "A+": 5, "A": 8,
    "B+": 10, "B": 12,
    "C": 15,
    "D": 20, "F": 25,
}

# ──────────────────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def _extract_json_safe(text: str) -> dict:
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"Invalid JSON:\n{text}")

    return json.loads(match.group())


def _priority_order(evaluation: dict) -> list[str]:
    weak = evaluation.get("weak_areas", [])
    scores = evaluation.get("domain_scores", {})

    for d, s in scores.items():
        if s is not None and s < 6 and d not in weak:
            weak.append(d)

    return sorted(weak, key=lambda x: scores.get(x, 0) or 0)


def _build_prompt(evaluation: dict, weeks: int, hours: int) -> str:
    return f"""
Generate a {weeks}-week roadmap.

Candidate: {evaluation.get('_meta', {}).get('candidate_name')}
Role: {evaluation.get('_meta', {}).get('role_target')}
Grade: {evaluation.get('grade')}
Weak Areas: {_priority_order(evaluation)}

Weekly Hours: {hours}

Return ONLY JSON.
"""


def _call_gemini(system_prompt: str, user_prompt: str) -> dict:
    try:
        response = _CLIENT.models.generate_content(
            model=_MODEL,
            contents=[
                {"role": "user", "parts": [{"text": user_prompt}]}
            ],
            config={
                "system_instruction": system_prompt,
                "max_output_tokens": 4096,
                "temperature": 0.3,
            }
        )

        if not response.text:
            raise ValueError("Empty Gemini response")

        return _extract_json_safe(response.text)

    except Exception as e:
        raise RuntimeError(f"Gemini failed: {str(e)}")


def _post_process(data: dict, evaluation: dict) -> dict:
    data.setdefault("weeks", [])
    data.setdefault("quick_wins", [])
    data.setdefault("long_term_advice", "")

    data["_meta"] = {
        "candidate": evaluation.get("_meta", {}).get("candidate_name"),
        "grade": evaluation.get("grade"),
        "model": _MODEL
    }

    return data

# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ──────────────────────────────────────────────────────────────────────────────

def generate_roadmap(evaluation: dict[str, Any]) -> dict[str, Any]:
    grade = evaluation.get("grade", "C")
    weeks = _WEEKS_BY_GRADE.get(grade, 8)
    hours = _HOURS_BY_GRADE.get(grade, 12)

    user_prompt = _build_prompt(evaluation, weeks, hours)

    result = _call_gemini(
        get_roadmap_system_prompt(),
        user_prompt
    )

    return _post_process(result, evaluation)


def generate_quick_tips(weak_areas: list[str]) -> dict[str, Any]:
    if not weak_areas:
        return {"tips": {},}

    system = """
Return ONLY JSON:
{
  "tips": {
    "<area>": {
      "top_3_concepts": [],
      "best_resource": "",
      "daily_practice": "",
      "one_week_goal": ""
    }
  }
}
"""

    user = f"Weak areas: {weak_areas}"

    result = _call_gemini(system, user)

    return result