import type { TopicStatus } from '@/types';

interface TopicTrackerProps {
  coverage: Record<string, TopicStatus>;
}

const statusColor: Record<TopicStatus, string> = {
  not_asked: 'bg-secondary text-muted-foreground',
  in_progress: 'bg-amber/15 text-amber border-amber/30',
  done: 'bg-green/15 text-green border-green/30',
  weak: 'bg-red/15 text-red border-red/30',
};

const TopicTracker = ({ coverage }: TopicTrackerProps) => (
  <div>
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic Coverage</h3>
    <div className="flex flex-wrap gap-2">
      {Object.entries(coverage).map(([topic, status]) => (
        <span
          key={topic}
          className={`rounded-full border border-transparent px-2.5 py-1 text-[11px] font-medium ${statusColor[status]}`}
        >
          {topic}
        </span>
      ))}
    </div>
  </div>
);

export default TopicTracker;
