import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChatPanel from '@/components/interview/ChatPanel';
import MessageInput from '@/components/interview/MessageInput';
import TopicTracker from '@/components/interview/TopicTracker';
import TimerBadge from '@/components/interview/TimerBadge';
import { useInterviewStore } from '@/store/interviewStore';
import { startSession, sendMessage, endSession } from '@/api/client';
import { AlertTriangle } from 'lucide-react';
const ques_lim = 11;
const Interview = () => {
  const navigate = useNavigate();
  const {
    session,
    candidateProfile,
    addMessage,
    updateTopicStatus,
    setEvaluation,
    setRoadmap,
    setElapsedSeconds,
    setSessionId,
    setIsEnded,
  } = useInterviewStore();

  const [isTyping, setIsTyping] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);

  // Start session on mount
  useEffect(() => {
    if (session.sessionId) return;
    const init = async () => {
      const profile = candidateProfile || {
        resumeFile: null,
        targetRole: 'Software Engineer',
        difficulty: 'medium' as const,
        skills: [],
        duration: 30,
      };
      const res = await startSession(profile);
      setSessionId(res.sessionId);

      // Add mock conversation
      addMessage({
        id: '1',
        role: 'interviewer',
        content: res.firstQuestion,
        timestamp: Date.now(),
      });
      updateTopicStatus('DSA', 'in_progress');
      updateTopicStatus('OOP', 'done');
      updateTopicStatus('Computer Networks', 'weak');
    };
    init();
  }, []);

  // Timer
  useEffect(() => {
    if (session.isEnded) return;
    const interval = setInterval(() => {
      setElapsedSeconds(session.elapsedSeconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.elapsedSeconds, session.isEnded]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!session.sessionId) return;

      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      });

      setIsTyping(true);
      try {
        const res = await sendMessage(session.sessionId, text);
        addMessage({
          id: crypto.randomUUID(),
          role: 'interviewer',
          content: res.reply,
          timestamp: Date.now(),
          isFollowUp: res.isFollowUp,
        });
        setQuestionCount((c) => {
          const newCount = c + 1;

          if (newCount >= ques_lim) {
            handleEnd(); // auto end interview
          }

          return newCount;
        });

        Object.entries(res.updatedTopics).forEach(([t, s]) => updateTopicStatus(t, s));
      } finally {
        setIsTyping(false);
      }
    },
    [session.sessionId]
  );

  const handleEnd = useCallback(async () => {
    if (!session.sessionId) return;
    setIsEnded(true);
    const res = await endSession(session.sessionId);
    setEvaluation(res.evaluation);
    setRoadmap(res.roadmap);
    navigate('/results');
  }, [session.sessionId]);

  return (
    <div className="flex h-screen bg-background">
      {/* Left - Chat */}
      <div className="flex flex-1 flex-col border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Technical Interview</h2>
          <TimerBadge seconds={session.elapsedSeconds} />
        </div>

        <ChatPanel messages={session.messages} isTyping={isTyping} />
        <MessageInput onSend={handleSend} disabled={isTyping || session.isEnded} />
      </div>

      {/* Right - Sidebar */}
      <div className="hidden w-80 flex-col gap-6 overflow-y-auto border-l border-border bg-card p-5 lg:flex">
        <TopicTracker coverage={session.topicCoverage} />

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interview Progress</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions</span>
              <span className="text-foreground">{questionCount} of ~12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="capitalize text-foreground">{candidateProfile?.difficulty || 'Medium'}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Strongest</span>
              <span className="text-green">{candidateProfile.skills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining</span>
              <span className="text-foreground">3 topics</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {!showEndConfirm ? (
            <Button
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => setShowEndConfirm(true)}
            >
              End Interview
            </Button>
          ) : (
            <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                End interview now?
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" className="flex-1" onClick={handleEnd}>
                  Yes, end
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => setShowEndConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
