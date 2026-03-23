import { useRef, useEffect } from 'react';
import InterviewerBubble from './InterviewerBubble';
import UserBubble from './UserBubble';
import type { Message } from '@/types';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatPanel = ({ messages, isTyping }: ChatPanelProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) =>
        msg.role === 'interviewer' ? (
          <InterviewerBubble key={msg.id} message={msg} />
        ) : (
          <UserBubble key={msg.id} message={msg} />
        )
      )}
      {isTyping && (
        <div className="flex gap-3 animate-fade-in">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <span className="text-[10px] font-bold text-primary">AI</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.4s]" />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatPanel;
