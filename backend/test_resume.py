from app.ai.Resume_parser import parse_resume_from_text
from app.ai.Interviewer import start_session, get_next_question
from app.ai.Evaluator import evaluate_session
from app.ai.Roadmap import generate_roadmap

# 1. Resume
resume = "I know Python and DSA"
resume_data = parse_resume_from_text(resume)

# 2. Interview
session = start_session("Soham", "SDE", resume_data=resume_data)
state = session["state"]

res = get_next_question(session["session_id"], "Answer 1", state)
state = res["state"]

# 3. Evaluation
evaluation = evaluate_session(state)

# 4. Roadmap
roadmap = generate_roadmap(evaluation)

print("FINAL ROADMAP:")
print(roadmap)