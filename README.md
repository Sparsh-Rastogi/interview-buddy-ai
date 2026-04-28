# Interview Buddy AI 🤖

Interview Buddy AI is an intelligent, AI-powered platform designed to help candidates master technical interviews. By leveraging advanced language models (Gemini & Claude), the system provides realistic mock interview sessions, adaptive questioning based on candidate performance, and comprehensive feedback with personalized learning roadmaps.

---

## 🏗️ Project Architecture

The project is split into two main parts:
- **Backend**: A FastAPI server handling AI logic, database persistence, and session management.
- **Frontend**: A modern React application providing an interactive and responsive user experience.

---

## ✨ Key Features

- **📄 Intelligent Resume Parsing**: Automatically extracts skills and experience from PDF resumes to customize the interview context.
- **🗣️ Adaptive Mock Interviews**: Real-time, multi-turn interviews that adjust difficulty and topics based on candidate responses.
- **📊 In-depth Evaluation**: Detailed feedback on technical accuracy, problem-solving depth, communication clarity, and more.
- **🗺️ Personalized Roadmaps**: Generates a weekly study plan focusing on identified weaknesses and target roles.
- **💾 Session Persistence**: Robust state management using Redis for caching and PostgreSQL for long-term storage.
- **📱 Responsive UI**: Optimized for both desktop and mobile interview practice.

---

## 🚀 Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (SQLAlchemy ORM)
- **Caching**: [Redis](https://redis.io/)
- **AI**: [Google Gemini](https://ai.google.dev/) & [Anthropic Claude](https://www.anthropic.com/)
- **Parsing**: `pdfplumber`

### Frontend
- **Framework**: [React 18](https://react.dev/) (Vite)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data**: [TanStack Query](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL
- Redis

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
bun install # or npm install
```

---

## ⚙️ Configuration

Create `.env` files in both `backend/` and `frontend/` directories.

### Backend `.env`
```env
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/interview_buddy
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
UPLOAD_DIR=uploads
FRONTEND_URL=http://localhost:8080
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### Start Frontend
```bash
cd frontend
bun run dev # or npm run dev
```
- UI: `http://localhost:8080`

---

## 🐘 PostgreSQL Quick Setup

```sql
-- Create database and enable UUID extension
CREATE DATABASE interview_buddy;
\c interview_buddy
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables are automatically created by the backend on startup via SQLAlchemy
```

---

## 🛣️ API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/resume/upload` | Upload & parse resume |
| `POST` | `/api/interview/start` | Initialize interview settings |
| `POST` | `/api/interview/answer` | Submit answer & get next question |
| `GET` | `/api/evaluation/{id}` | Get performance evaluation |
| `GET` | `/api/roadmap/{id}` | Generate personalized roadmap |

---

## 🧪 Testing

- **Backend AI Core**: `cd backend && python test_resume.py`
- **Frontend Unit Tests**: `cd frontend && bun run test`
- **Frontend E2E**: `cd frontend && bun run test:e2e`
