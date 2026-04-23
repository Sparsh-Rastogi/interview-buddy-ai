from app.ai.Resume_parser import parse_resume_from_text
from app.ai.Interviewer import start_session, get_next_question
from app.ai.Evaluator import evaluate_session
from app.ai.Roadmap import generate_roadmap

# 1. Resume
resume1 = "I am Soham Labhshetwar, I am from Nanded, Maharashtra. I am 1800 rated on CodeForces and I have a very good knowledge of DSA."
resume = "I am Nisha, I have a very good knowledge of ML, I have worked with several machine learning models and projects including LLM, Reinforcement Learning and Neural Networks."
resume_data = parse_resume_from_text(resume)
print(resume_data)
# 2. Interview
session = start_session("Nisha", "ML", resume_data=resume_data)
state = session["state"]

res = get_next_question(session["session_id"], "Answer 1", state)
# print(res)
state = res["state"]

# 3. Evaluation
evaluation = evaluate_session(state)
print(evaluation)

# 4. Roadmap
roadmap = generate_roadmap(evaluation)

print("FINAL ROADMAP:")
print(roadmap)