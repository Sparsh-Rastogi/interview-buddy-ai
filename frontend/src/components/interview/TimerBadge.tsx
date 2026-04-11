import { Clock } from 'lucide-react';

const TimerBadge = ({ seconds }: { seconds: number }) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono text-muted-foreground">
      <Clock className="h-3 w-3" />
      {m}:{s}
    </div>
  );
};

export default TimerBadge;
