"""
app/ai/__init__.py
──────────────────
Public surface of the AI module.

Route handlers import from here:
    from app.ai.interviewer    import start_session, get_next_question, end_session
    from app.ai.evaluator      import evaluate_session, evaluate_single_answer
    from app.ai.resume_parser  import parse_resume, parse_resume_from_text
    from app.ai.roadmap        import generate_roadmap, generate_quick_tips
    from app.ai.prompts        import get_all_system_prompts
"""

from app.ai.evaluator import evaluate_session, evaluate_single_answer
from app.ai.interviewer import (
    end_session,
    get_next_question,
    get_session_state,
    start_session,
)
from app.ai.prompts import get_all_system_prompts, get_base_system_prompt
from app.ai.resume_parser import parse_resume, parse_resume_from_text
from app.ai.roadmap import generate_quick_tips, generate_roadmap

__all__ = [
    # interviewer
    "start_session",
    "get_next_question",
    "get_session_state",
    "end_session",
    # evaluator
    "evaluate_session",
    "evaluate_single_answer",
    # resume parser
    "parse_resume",
    "parse_resume_from_text",
    # roadmap
    "generate_roadmap",
    "generate_quick_tips",
    # prompts
    "get_base_system_prompt",
    "get_all_system_prompts",
]