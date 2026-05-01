import { create } from 'zustand';
import type { CandidateProfile, Message, TopicStatus, EvaluationResult, RoadmapWeek } from '@/types';

interface InterviewStore {
  candidateProfile: CandidateProfile | null;
  session: {
    sessionId: string | null;
    messages: Message[];
    topicCoverage: Record<string, TopicStatus>;
    questionsAsked: string[];
    depthScores: Record<string, number>;
    elapsedSeconds: number;
    isEnded: boolean;
  };
  evaluation: EvaluationResult;
  roadmap: RoadmapWeek[];

  setCandidateProfile: (profile: CandidateProfile) => void;
  addMessage: (message: Message) => void;
  updateTopicStatus: (topic: string, status: TopicStatus) => void;
  setEvaluation: (result: EvaluationResult) => void;
  setRoadmap: (weeks: RoadmapWeek[]) => void;
  setElapsedSeconds: (seconds: number) => void;
  setSessionId: (id: string) => void;
  setIsEnded: (ended: boolean) => void;
  resetSession: () => void;
}

const initialSession = {
  sessionId: null,
  messages: [],
  topicCoverage: {
    'DSA': 'not_asked' as TopicStatus,
    'OOP': 'not_asked' as TopicStatus,
    'Operating Systems': 'not_asked' as TopicStatus,
    'DBMS': 'not_asked' as TopicStatus,
    'Computer Networks': 'not_asked' as TopicStatus,
    'Behavioral': 'not_asked' as TopicStatus,
  },
  questionsAsked: [],
  depthScores: {},
  elapsedSeconds: 0,
  isEnded: false,
};

export const useInterviewStore = create<InterviewStore>((set) => ({
  candidateProfile: null,
  session: { ...initialSession },
  evaluation: null,
  roadmap: [],

  setCandidateProfile: (profile) => set({ candidateProfile: profile }),

  addMessage: (message) =>
    set((state) => ({
      session: {
        ...state.session,
        messages: [...state.session.messages, message],
      },
    })),

  updateTopicStatus: (topic, status) =>
    set((state) => ({
      session: {
        ...state.session,
        topicCoverage: { ...state.session.topicCoverage, [topic]: status },
      },
    })),

  setEvaluation: (result) => set({ evaluation: result }),
  setRoadmap: (weeks) => set({ roadmap: weeks }),
  setElapsedSeconds: (seconds) =>
    set((state) => ({
      session: { ...state.session, elapsedSeconds: seconds },
    })),
  setSessionId: (id) =>
    set((state) => ({
      session: { ...state.session, sessionId: id },
    })),
  setIsEnded: (ended) =>
    set((state) => ({
      session: { ...state.session, isEnded: ended },
    })),

  resetSession: () =>
    set({
      candidateProfile: null,
      session: { ...initialSession, topicCoverage: { ...initialSession.topicCoverage } },
      evaluation: null,
      roadmap: [],
    }),
}));
