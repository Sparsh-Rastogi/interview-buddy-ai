import axios from 'axios';
import type { CandidateProfile, TopicStatus, EvaluationResult, RoadmapWeek } from '@/types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});
const res = await api.get('/api/health');
console.log('API base URL:', res);
// TODO: Replace with real API calls

export async function startSession(profile: CandidateProfile): Promise<{ sessionId: string; firstQuestion: string }> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    sessionId: crypto.randomUUID(),
    firstQuestion:
      "Let's start with something from your resume. You mentioned building a REST API with Node.js — can you walk me through how you handled authentication in that project?",
  };
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<{
  reply: string;
  isFollowUp: boolean;
  updatedTopics: Record<string, TopicStatus>;
  shouldEnd: boolean;
}> {
  await new Promise((r) => setTimeout(r, 1200));

  const replies = [
    {
      reply: "That's a good start. Can you explain the difference between symmetric and asymmetric encryption, and which one JWT uses?",
      isFollowUp: true,
    },
    {
      reply: "Let's move on to data structures. Can you explain how a hash map handles collisions, and what are the trade-offs between chaining and open addressing?",
      isFollowUp: false,
    },
    {
      reply: "Interesting approach. What would happen if your database goes down while processing a transaction? How would you ensure data consistency?",
      isFollowUp: true,
    },
    {
      reply: "Good. Now, can you walk me through how TCP establishes a connection? What's the three-way handshake?",
      isFollowUp: false,
    },
  ];

  const pick = replies[Math.floor(Math.random() * replies.length)];
  return {
    ...pick,
    updatedTopics: {},
    shouldEnd: false,
  };
}

export async function endSession(
  sessionId: string
): Promise<{ evaluation: EvaluationResult; roadmap: RoadmapWeek[] }> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    evaluation: {
      overallScore: 72,
      dimensions: {
        technical: 7,
        problemSolving: 6,
        communication: 8,
        depth: 5,
        clarity: 7,
      },
      feedback: [
        {
          question: 'How did you handle authentication in your Node.js REST API?',
          userAnswer: 'I used JWT tokens. The user logs in, gets a token, and sends it in the header for every request.',
          verdict: 'adequate',
          notes: 'Good basic understanding but lacked detail on token storage, expiry, and refresh mechanisms.',
        },
        {
          question: 'What happens if that JWT token is stolen? How would you handle token revocation?',
          userAnswer: 'You could use short-lived tokens and maintain a blacklist on the server side.',
          verdict: 'adequate',
          notes: 'Mentioned blacklisting but didn\'t discuss Redis-based approaches or token rotation.',
        },
        {
          question: 'Explain how a hash map handles collisions.',
          userAnswer: 'Hash maps use chaining where each bucket has a linked list of entries.',
          verdict: 'strong',
          notes: 'Clear explanation with good understanding of chaining. Could improve by discussing load factor and rehashing.',
        },
      ],
      mistakes: [
        'Confused symmetric and asymmetric encryption use cases in JWT',
        'Did not mention refresh token rotation for security',
        'Incomplete understanding of TCP congestion control',
      ],
      strengths: [
        'Good OOP fundamentals',
        'Clear communication of REST API concepts',
        'Strong understanding of hash map internals',
      ],
    },
    roadmap: [
      {
        week: 1,
        focus: 'Strengthen DSA foundations',
        topics: ['Arrays', 'Sliding Window', 'Two Pointers'],
        problems: ['Two Sum', 'Merge Intervals', 'LRU Cache'],
      },
      {
        week: 2,
        focus: 'Trees & Graphs',
        topics: ['BFS/DFS', 'Dijkstra', 'Topological Sort'],
        problems: ['Binary Tree Level Order', 'Course Schedule', 'Network Delay Time'],
      },
      {
        week: 3,
        focus: 'Core CS subjects',
        topics: ['OS Scheduling', 'DBMS Transactions', 'TCP/IP'],
        problems: ['Process Scheduling Simulation', 'ACID Properties', 'TCP Handshake Diagram'],
      },
      {
        week: 4,
        focus: 'System Design basics',
        topics: ['Load Balancing', 'Caching', 'CAP Theorem'],
        problems: ['Design URL Shortener', 'Design Rate Limiter', 'Design Chat System'],
      },
    ],
  };
}

export default api;
