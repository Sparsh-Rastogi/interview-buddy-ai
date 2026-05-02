# Interview Buddy AI - Backend

This is the backend for the Interview Buddy AI application, an AI-powered platform designed to help candidates prepare for technical interviews through realistic mock sessions and personalized feedback.

## 🚀 Tech Stack

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Language:** Python 3.9+
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via SQLAlchemy ORM)
- **Caching & Session Management:** [Redis](https://redis.io/)
- **AI Models:**
  - [Google Gemini](https://ai.google.dev/) (Main interview engine)
  - [Anthropic Claude](https://www.anthropic.com/) (Optional evaluation & parsing)
- **Utilities:**
  - `pdfplumber` for resume parsing
  - `pydantic` for data validation

## ✨ Features

- **Resume Analysis:** Automatically extracts skills and experience from PDF resumes to tailor the interview.
- **Adaptive Mock Interviews:** Real-time, multi-turn interviews powered by Gemini, adjusting difficulty based on candidate responses.
- **In-depth Evaluation:** Comprehensive feedback on technical skills, problem-solving, and communication.
- **Personalized Roadmaps:** Weekly study plans generated based on interview performance and identified weaknesses.
- **Session Persistence:** State management using Redis and PostgreSQL.

## 📁 Project Structure

```text
backend/
├── app/
│   ├── ai/            # AI logic (Gemini/Claude integration)
│   ├── db/            # Database models and session management
│   ├── routes/        # API endpoints (FastAPI routers)
│   ├── utils/         # Helper functions (Redis, parsing, etc.)
│   ├── config.py      # Environment configuration
│   └── main.py        # Application entry point
├── requirements.txt   # Python dependencies
└── ReadMe.md          # This file
```

## 🛠️ Setup & Installation

### 1. Prerequisites
- Python 3.9 or higher
- PostgreSQL
- Redis

### 2. Clone the repository
```bash
git clone <repository-url>
cd interview-buddy-ai/backend
```

### 3. Create a virtual environment
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```
### 5. PostgreSQL Quick Setup

```bash
-- 1. Login as postgres user
sudo -u postgres psql

-- 2. Create database
CREATE DATABASE db_name;

-- 3. Connect to database
\c db_name

-- 4. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    score DOUBLE PRECISION,
    feedback JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Exit psql
\q

```

### 6. Connecting a Cloud Redis Database Using `.env`
Instead of running Redis locally on your machine (`localhost:6379`), you can use a cloud-hosted Redis database provided by Redis Cloud.

This guide explains how to:

1. Go to the Redis website:
   https://redis.io/

2. Sign up or log in.

3. Navigate to **Redis Cloud**.

4. Create a new database:
   - Choose a free plan (if available)
   - Select a cloud provider/region
   - Set a database name

5. Open your database dashboard.
6. Locate the **Endpoint / Public Endpoint / Redis URL** section.
7. Copy the connection string.

It will look something like this: ```redis://default:AbCdEf123456@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345 ```


### 5. Configure Environment Variables
Create a `.env` file in the `backend/` directory (or use the one in the root) with the following:

```env
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/interview_buddy
REDIS_URL=redis://localhost:6379
GROQ_API_KEY= YOUR_GROQ_API_KEY
```

## 🏃 Running the Application

Start the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
You can access the interactive documentation (Swagger UI) at `http://localhost:8000/docs`.

## 🧪 Testing

A standalone script `test_resume.py` is provided to test the end-to-end flow of the AI core (parsing -> interview -> evaluation -> roadmap) without running the full web server.

```bash
python test_resume.py
```

