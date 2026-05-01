export type Message = {
  id: string;
  role: 'interviewer' | 'user';
  content: string;
  timestamp: number;
  isFollowUp?: boolean;
};

export type TopicStatus = 'not_asked' | 'in_progress' | 'done' | 'weak';

export type CandidateProfile = {
  name?: string;
  resumeFile: File | null;
  targetRole: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  duration: number;
};

export type SessionState = {
  sessionId: string | null;
  candidateProfile: CandidateProfile | null;
  messages: Message[];
  topicCoverage: Record<string, TopicStatus>;
  questionsAsked: string[];
  depthScores: Record<string, number>;
  elapsedSeconds: number;
  isEnded: boolean;
};

export type EvaluationResult = {
  overallScore: number;
  dimensions: {
    technical: number;
    problemSolving: number;
    communication: number;
    depth: number;
    clarity: number;
  };
  feedback: string;
  mistakes: string[];
  strengths: string[];
};

export type QuestionFeedback = {
  question: string;
  userAnswer: string;
  verdict: 'strong' | 'adequate' | 'weak';
  notes: string;
};

export type RoadmapWeek = {
  week: number;
  focus: string;
  objectives: string[];
  activities: string[];
};
