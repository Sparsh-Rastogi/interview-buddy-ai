import type { Message } from '@/types';

const InterviewerBubble = ({ message }: { message: Message }) => (
  <div className="flex gap-3 animate-fade-in">
    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
      <span className="text-[10px] font-bold text-primary">AI</span>
    </div>
    <div className="max-w-[85%]">
      {message.isFollowUp && (
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber/10 px-2 py-0.5 text-[10px] font-medium text-amber">
          ↳ Follow-up
        </span>
      )}
      <div className="rounded-lg rounded-tl-sm border border-border bg-card p-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">{message.content}</p>
      </div>
    </div>
  </div>
);

export default InterviewerBubble;
