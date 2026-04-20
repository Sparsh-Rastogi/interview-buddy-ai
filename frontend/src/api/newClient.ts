import axios, { AxiosInstance, AxiosResponse } from "axios";
import type {
  CandidateProfile,
  TopicStatus,
  EvaluationResult,
  RoadmapWeek,
} from "@/types";

// ─────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.detail ?? error.message ?? "Unknown error";
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────
// Internal response types (backend shapes)
// ─────────────────────────────────────────────

interface UploadResumeResponse {
  session_id: string;
  parsed_resume: {
    name?: string;
    skills: string[];
    experience: string[];
    [key: string]: unknown;
  };
}

interface StartInterviewResponse {
  session_id: string;
  first_question: string;
}

interface AnswerResponse {
  next_question: string | null;
  is_done: boolean;
}

interface EvaluationResponse {
  evaluation: EvaluationResult;
}

interface RoadmapResponse {
  roadmap: RoadmapWeek[];
}

// ─────────────────────────────────────────────
// Internal API calls (not exported)
// ─────────────────────────────────────────────

async function uploadResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res: AxiosResponse<UploadResumeResponse> = await api.post(
    "/api/resume/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
}

async function startInterview(
  sessionId: string,
  profile: CandidateProfile,
  numQuestions: number
): Promise<StartInterviewResponse> {
  const res: AxiosResponse<StartInterviewResponse> = await api.post(
    "/api/interview/start",
    {
      session_id: sessionId,
      target_role: profile.targetRole,
      difficulty: profile.difficulty,
      duration: profile.duration,
      num_questions: numQuestions,
    }
  );

  return res.data;
}

async function sendAnswer(
  sessionId: string,
  answer: string
): Promise<AnswerResponse> {
  const res: AxiosResponse<AnswerResponse> = await api.post(
    "/api/interview/answer",
    { session_id: sessionId, answer }
  );

  return res.data;
}

async function endInterview(sessionId: string): Promise<void> {
  await api.post("/api/interview/end", { session_id: sessionId });
}

async function fetchEvaluation(sessionId: string): Promise<EvaluationResult> {
  // NOTE: swap to POST if backend confirms POST shape
  const res: AxiosResponse<EvaluationResponse> = await api.get(
    `/api/evaluation/${sessionId}`
  );

  return res.data.evaluation;
}

async function fetchRoadmap(sessionId: string): Promise<RoadmapWeek[]> {
  // NOTE: swap to POST if backend confirms POST shape
  const res: AxiosResponse<RoadmapResponse> = await api.get(
    `/api/roadmap/${sessionId}`
  );

  return res.data.roadmap;
}

// ─────────────────────────────────────────────
// Exported functions — matches your mock contract
// ─────────────────────────────────────────────

/**
 * Uploads resume then starts the interview session.
 * resumeFile must be present on the profile — throws if missing.
 */
export async function startSession(
  profile: CandidateProfile
): Promise<{ sessionId: string; firstQuestion: string }> {
  if (!profile.resumeFile) {
    throw new Error("No resume file provided in CandidateProfile.");
  }

  // Step 1: upload resume → get session_id from backend
  const { session_id } = await uploadResume(profile.resumeFile);

  // Step 2: start interview with that session_id + profile config
  // numQuestions derived from duration: 1 question per 5 minutes, minimum 3
//   const numQuestions = Math.max(3, Math.floor(profile.duration / 5));
  num_questions: profile.numQuestions  
  const { first_question } = await startInterview(
    session_id,
    profile,
    numQuestions
  );

  return {
    sessionId: session_id,
    firstQuestion: first_question,
  };
}

/**
 * Sends one answer, returns the next question (or empty string if done)
 * plus shouldEnd flag and empty updatedTopics (backend does not return topics).
 */
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<{
  reply: string;
  isFollowUp: boolean;
  updatedTopics: Record<string, TopicStatus>;
  shouldEnd: boolean;
}> {
  const { next_question, is_done } = await sendAnswer(sessionId, message);

  return {
    reply: next_question ?? "",
    isFollowUp: false,      // backend does not return this — extend AnswerResponse if needed
    updatedTopics: {},      // backend does not return this — extend AnswerResponse if needed
    shouldEnd: is_done,
  };
}

/**
 * Ends the session, then fetches evaluation and roadmap in parallel.
 */
export async function endSession(
  sessionId: string
): Promise<{ evaluation: EvaluationResult; roadmap: RoadmapWeek[] }> {
  // Signal backend the interview is over first
  await endInterview(sessionId);

  // Then fetch both results concurrently
  const [evaluation, roadmap] = await Promise.all([
    fetchEvaluation(sessionId),
    fetchRoadmap(sessionId),
  ]);

  return { evaluation, roadmap };
}

export default api;