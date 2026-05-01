"""
interviewer.py
──────────────
Groq-based adaptive interview engine (production-ready)
"""

from __future__ import annotations

import json
import os
import re
import time
import uuid
from typing import Any

from dotenv import load_dotenv
from groq import Groq

from app.ai.prompts import (
    Difficulty,
    Domain,
    get_base_system_prompt,
    get_closing_system_addendum,
    get_domain_transition_prompt,
    get_opening_prompt,
)

# ──────────────────────────────────────────────────────────────────────────────
# ENV LOADING
# ──────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../../.env"))

load_dotenv(ENV_PATH)

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")

# ──────────────────────────────────────────────────────────────────────────────
# GROQ CLIENT
# ──────────────────────────────────────────────────────────────────────────────

_CLIENT = Groq(api_key=API_KEY)
_MODEL_PRIMARY = "openai/gpt-oss-120b"
_MODEL_FALLBACK = "openai/gpt-oss-120b"

_DEFAULT_DOMAINS: list[Domain] = ["DSA", "OOP", "OS", "DBMS", "CN", "Behavioral"]

_QUESTIONS_PER_DOMAIN = 5
_SCALE_THRESHOLD = 2
_END_SIGNAL = "that wraps up our session for today"

# ──────────────────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def _detect_end_signal(text: str) -> bool:
    return _END_SIGNAL in text.lower()


def _difficulty_step_up(current: Difficulty) -> Difficulty:
    order = ["easy", "medium", "hard"]
    return order[min(order.index(current) + 1, len(order) - 1)]


def _difficulty_step_down(current: Difficulty) -> Difficulty:
    order = ["easy", "medium", "hard"]
    return order[max(order.index(current) - 1, 0)]


def _current_domain(state: dict) -> Domain:
    return state["domains"][min(state["domain_index"], len(state["domains"]) - 1)]


def _build_system_prompt(state: dict, closing: bool = False) -> str:
    resume_data = state.get("resume_data")
    resume_summary = resume_data.get("resume_summary") if resume_data else None

    prompt = get_base_system_prompt(
        difficulty=state["difficulty"],
        domains=state["domains"],
        candidate_name=state["candidate_name"],
        role_target=state["role_target"],
        resume_summary=resume_summary,
    )

    if closing:
        prompt += get_closing_system_addendum(state["candidate_name"])

    return prompt


def _score_answer_heuristic(answer: str) -> int:
    if not answer.strip():
        return 0

    word_count = len(answer.split())
    score = min(word_count // 15, 5)

    keywords = [
        "complexity", "algorithm", "data structure", "tree", "graph",
        "hash", "thread", "process", "tcp", "http", "async"
    ]

    bonus = sum(1 for kw in keywords if kw in answer.lower())
    return min(score + min(bonus, 5), 10)


# ──────────────────────────────────────────────────────────────────────────────
# GROQ CALL (same function name preserved)
# ──────────────────────────────────────────────────────────────────────────────

def _groq_chat(messages, temperature=0.7, max_tokens=300):
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

    # fallback
    response = _CLIENT.chat.completions.create(
        model=_MODEL_FALLBACK,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def _call_gemini(system_prompt: str, conversation: list[dict]) -> str:
    """
    Converted to Groq but function name unchanged
    """

    messages = []

    # system prompt
    messages.append({"role": "system", "content": system_prompt})

    # conversation
    for msg in conversation:
        role = "assistant" if msg["role"] == "model" else msg["role"]
        messages.append({
            "role": role,
            "content": msg["content"]
        })

    content = _groq_chat(messages, temperature=0.7, max_tokens=300)

    if not content:
        return "Let's continue. Can you explain your previous answer in more detail?"

    return content.strip()


# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ──────────────────────────────────────────────────────────────────────────────

def start_session(
    candidate_name: str,
    role_target: str = "Software Development Engineer",
    difficulty: Difficulty = "medium",
    domains: list[Domain] | None = None,
    resume_data: dict | None = None,
    max_questions: int = 20,
    session_id: str | None = None,
) -> dict[str, Any]:

    sid = session_id or str(uuid.uuid4())
    # print(candidate_name)
    if domains is None:
        domains = list(_DEFAULT_DOMAINS)

    state = {
        "session_id": sid,
        "candidate_name": candidate_name,
        "role_target": role_target,
        "resume_data": resume_data,
        "difficulty": difficulty,
        "domains": domains,
        "domain_index": 0,
        "domain_q_count": 0,
        "questions_asked": [],
        "conversation": [],
        "consecutive_correct": 0,
        "consecutive_wrong": 0,
        "domain_scores": {d: [] for d in domains},
        "status": "active",
        "started_at": time.time(),
        "question_count": 0,
        "max_questions": max_questions,
    }

    opening = get_opening_prompt(candidate_name, role_target)

    state["conversation"].append({"role": "model", "content": opening})
    state["questions_asked"].append(opening)
    state["question_count"] += 1

    return {
        "session_id": sid,
        "question": opening,
        "domain": _current_domain(state),
        "difficulty": difficulty,
        "question_number": state["question_count"],
        "status": "active",
        "state": state,
    }


def get_next_question(
    session_id: str,
    candidate_answer: str,
    session_state: dict[str, Any],
) -> dict[str, Any]:

    state = session_state

    if state["status"] == "ended":
        return {"status": "ended", "state": state}

    state["conversation"].append({
        "role": "user",
        "content": candidate_answer
    })

    score = _score_answer_heuristic(candidate_answer)
    domain = _current_domain(state)

    state["domain_scores"][domain].append(score)

    if score >= 7:
        state["consecutive_correct"] += 1
        state["consecutive_wrong"] = 0
    elif score <= 3:
        state["consecutive_wrong"] += 1
        state["consecutive_correct"] = 0

    if state["consecutive_correct"] >= _SCALE_THRESHOLD:
        state["difficulty"] = _difficulty_step_up(state["difficulty"])
        state["consecutive_correct"] = 0

    if state["consecutive_wrong"] >= _SCALE_THRESHOLD:
        state["difficulty"] = _difficulty_step_down(state["difficulty"])
        state["consecutive_wrong"] = 0

    state["domain_q_count"] += 1
    if state["domain_q_count"] >= _QUESTIONS_PER_DOMAIN:
        if state["domain_index"] < len(state["domains"]) - 1:
            state["domain_index"] += 1
            state["domain_q_count"] = 0

    closing = state["question_count"] >= state["max_questions"] - 2

    system_prompt = _build_system_prompt(state, closing)

    reply = _call_gemini(system_prompt, state["conversation"])
    clean_reply = re.sub(r"\[INTERNAL:.*?\]", "", reply).strip()

    if _detect_end_signal(clean_reply):
        state["status"] = "ended"

    state["conversation"].append({
        "role": "model",
        "content": clean_reply
    })

    state["questions_asked"].append(clean_reply)
    state["question_count"] += 1

    return {
        "session_id": session_id,
        "question": clean_reply,
        "domain": _current_domain(state),
        "difficulty": state["difficulty"],
        "question_number": state["question_count"],
        "status": state["status"],
        "state": state,
    }