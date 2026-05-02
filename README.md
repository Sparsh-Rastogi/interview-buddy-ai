# 🤖 Interview Buddy AI

> An intelligent mock interview agent that simulates realistic technical and domain-specific interviews, adapts to your resume, and gives you a personalized roadmap to improve.

---
## 📌 Project Submission

This is a group project submitted as part of the **Exploratory Project** for **EC-291** at **Electronics Department**.

| Team Member | Roll Number |
|---|---|
| Labhshetwar Soham Laxmikant | 24095052 |
| Nisha | 24095071 |
| Sparsh Rastogi | 24095113 |

---

## 🧠 What is Interview Buddy AI?

Interview Buddy AI is a full-stack AI-powered mock interview platform. A user uploads their resume, selects their target role, and the system conducts a structured, adaptive interview — asking relevant questions, cross-examining vague answers, tracking performance, and finally generating a detailed evaluation report and a personalized weekly study roadmap, both of which can be downloaded as PDFs.

The agent behaves like a real interviewer: it does not give away answers, challenges shallow responses with follow-up questions, adjusts difficulty dynamically, and covers all the topics relevant to the user's target role.

---

## 🎯 Use Case

Targeted at:
- **CS/Engineering students** preparing for campus placements or internships
- **Job seekers** preparing for technical roles across Software, ML, Electronics, and Systems domains
- **Self-learners** who want honest, structured feedback on their technical knowledge

---

## 🗂️ Project Structure

```
Interview-Buddy-AI/
├── backend/         # FastAPI server, AI engine, routes, session management
│   └── README.md    # Backend setup, dependencies, and API endpoints
├── frontend/        # React application with Axios integration
│   └── README.md    # Frontend setup and dependencies
└── README.md        # This file
```

> Each folder has its own `README.md` with setup instructions, dependencies, and environment variables. Refer to those for running the project locally.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| HTTP Client | Axios |
| Backend | FastAPI (Python) |
| AI / LLM | Groq API |
| Resume Parsing | Python (pdfplumber) |
| Session Storage | Redis |
| Speech-to-Text | Web Speech API (webkitSpeechRecognition) |
| PDF Export | html2pdf.js (client-side) |
| Database | PostgreSQL / SQLAlchemy |

---

## 🎭 Target Interview Roles

Interview Buddy AI is **not limited to software engineering**. It currently supports mock interviews for the following roles:

| Role | Coverage |
|---|---|
| **Software Engineer** | DSA, OOP, DBMS, OS, CN, Behavioral, Project-based |
| **ML Engineer** | ML fundamentals, model evaluation, statistics, Python, deep learning basics |
| **System Design** | Scalability, databases, caching, load balancing, distributed systems |
| **Digital Electronics** | Logic gates, flip-flops, combinational & sequential circuits, microcontrollers |
| **Analog Electronics** | Op-amps, filters, transistors, signal processing, circuit analysis |

The interview questions are personalized based on the user's uploaded resume and selected target role.

---

## ✨ Features

### 1. Resume-Aware Questioning
- Parses uploaded PDF/DOCX resumes
- Extracts skills, projects, technologies, and domains
- Generates personalized questions based on what the candidate has claimed
- Flags shallow or vague claims for deeper probing

### 2. Adaptive Interviewing
- Dynamically adjusts question difficulty based on response quality
- Covers multiple domains relevant to the target role
- Never repeats a question within a session
- Maintains full conversation memory throughout the session

### 3. Cross-Questioning
- After every response, the AI analyzes correctness, depth, and clarity
- Asks targeted follow-up questions for vague or surface-level answers
- Introduces edge cases, optimizations, and real-world scenarios

### 4. Evaluation Report
At the end of the interview, the system generates a detailed report covering:
- Technical knowledge score
- Problem-solving ability score
- Communication clarity score
- Depth of understanding score
- Overall rating
- Specific mistakes and misconceptions highlighted
- Downloadable as **PDF**

### 5. Voice Input
- Users can speak their answers using the browser's built-in Web Speech API (`webkitSpeechRecognition`)
- Speech is transcribed in real time and submitted as text to the interview engine
- Enables a more natural, interview-like experience without typing

### 6. Personalized Study Roadmap
- Generated based on weak areas identified during the interview
- Includes topics to revise, suggested problems, and concepts to study
- Structured as a **week-by-week plan**
- Downloadable as **PDF**

---

## 🔌 API Overview

The backend exposes a RESTful API. Full details (request/response shapes, headers, error codes) are documented in `backend/README.md`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/resume/upload` | Upload and parse resume (starts session) |
| `POST` | `/api/interview/start` | Initialize interview settings |
| `POST` | `/api/interview/answer` | Submit an answer and get the next question |
| `POST` | `/api/interview/end` | End the interview session  |
| `GET` | `/api/evaluation/{session_id}` | Get interview performance evaluation |
| `GET` | `/api/roadmap/{session_id}` | Generate personalized learning roadmap |
---

## 🚀 Getting Started

Refer to the individual README files for full setup:

- **Backend:** `backend/README.md` — FastAPI server setup, Python dependencies, `.env` configuration
- **Frontend:** `frontend/README.md` — React app setup, Axios configuration, environment variables

**Quick start (after following both READMEs):**

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

FastAPI interactive docs available at: `http://localhost:8000/docs`

---

## 📄 PDF Downloads

Users can download two documents at the end of every interview session:

- **Interview Summary PDF** — full transcript with questions, answers, scores, and feedback
- **Study Roadmap PDF** — personalized week-by-week improvement plan

Both are generated client-side using **html2pdf.js**, which renders the on-screen report directly into a downloadable PDF — no server round-trip required for export.

---

## 🔮 Future Enhancements

### 🏢 Company-Specific Interview Modes
Specialized prompting per company (e.g., Google, Amazon, Nvidia, Qualcomm) to simulate the style, difficulty, and focus areas of that company's actual interview process. Each mode would adjust question patterns, emphasis areas, and evaluation criteria accordingly.

### 🧩 LeetCode Problem Integration
After identifying a weak DSA topic, the system would surface specific LeetCode (or similar) problems tagged to that topic — giving the user a direct, actionable next step rather than just a topic name.

### 📊 Performance History & Analytics
Track interview performance over multiple sessions. Show improvement trends across domains, topics, and difficulty levels through a personal dashboard.

---

## 📝 Notes

- All API keys (Groq, etc.) are stored in `.env` files and are never committed to the repository.
- Session state is stored in **Redis** for the duration of the interview and cleared once the session ends.
- Voice input via `webkitSpeechRecognition` works best on Chromium-based browsers (Chrome, Edge). Firefox support is limited.
- The project is designed to be modular — the AI engine, backend routes, and frontend integration are independently developed and loosely coupled.

---

## 📚 What We Learnt

### Technical

**Prompt Engineering**
Working with the Groq API taught us that the quality of the AI's output is almost entirely dependent on how well the system prompt is written. We learnt how to structure multi-role prompts, enforce behavioral constraints (no giving away answers, dynamic difficulty), and use conversation history to maintain context across a full interview session.

**Redis for Session Management**
We used Redis for the first time to manage live session state — storing per-session conversation history, asked questions, and user performance signals. This taught us the difference between ephemeral in-memory state and a proper key-value store, and how TTL (time-to-live) can automatically clean up stale sessions.

**FastAPI & RESTful API Design**
Building the backend in FastAPI gave us hands-on experience designing a clean REST API — choosing the right HTTP methods (GET vs POST vs PATCH vs DELETE), writing Pydantic schemas for request/response validation, and understanding how async route handlers work in Python.

**Resume Parsing**
Extracting structured information from unformatted PDF and DOCX resumes is harder than it looks. We learnt how to use Python libraries to extract raw text and then use the LLM itself to parse that text into structured fields like skills, projects, and domains.

**Frontend–Backend Integration with Axios**
Setting up a centralised Axios instance with interceptors, handling async state across multiple API calls, and managing session IDs in React Context gave us a solid understanding of how a modern frontend communicates with a REST backend.

**Web Speech API (webkitSpeechRecognition)**
Integrating browser-native speech recognition was a new experience. We learnt about browser compatibility limitations, handling interim vs final transcripts, and how to gracefully degrade when the API is unavailable.

**Client-Side PDF Generation with html2pdf.js**
Rather than generating PDFs server-side, we used html2pdf.js to convert rendered React components directly into downloadable PDFs. This taught us about DOM-to-canvas rendering, page-break handling, and the trade-offs between client-side and server-side PDF generation.

---

### Team & Project Management

**Defining Interfaces Before Writing Code**
The most valuable process decision we made was agreeing on the API contract (request/response shapes in `schemas.py`) before anyone wrote a single route or Axios call. This meant all three members could work in parallel without blocking each other.

**Modular Ownership**
Splitting the project into three distinct layers — AI core, backend API, and frontend integration — with clear file-level ownership made it easy to track progress and avoid merge conflicts. Each member had a visible, testable deliverable at every stage.

**Debugging Across Three Layers**
When something broke, it could be the prompt, the route, or the frontend. We learnt to isolate each layer independently — using FastAPI's `/docs` to test routes without the frontend, and using hardcoded mock responses in Axios before the backend was ready.

**Scope Management**
We started with a broader feature list and had to make deliberate decisions about what to cut for the submission deadline. Prioritising core functionality (adaptive interview, evaluation, PDF export) over nice-to-haves (leaderboard, HR round) was a valuable lesson in scoping a project realistically.

---

## 📃 License

This project was developed for academic purposes as part of an exploratory project submission. Not intended for commercial use.