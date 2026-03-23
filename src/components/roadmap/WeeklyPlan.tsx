import type { RoadmapWeek } from '@/types';

const TopicChip = ({ label }: { label: string }) => (
  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
    {label}
  </span>
);

const WeeklyPlan = ({ week }: { week: RoadmapWeek }) => (
  <div className="relative pl-8">
    {/* Timeline dot & line */}
    <div className="absolute left-0 top-0 flex h-full flex-col items-center">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {week.week}
      </div>
      <div className="flex-1 w-px bg-border" />
    </div>

    <div className="rounded-lg border border-border bg-card p-5 mb-4">
      <h3 className="text-sm font-semibold text-foreground">
        Week {week.week} — {week.focus}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {week.topics.map((t) => (
          <TopicChip key={t} label={t} />
        ))}
      </div>
      <div className="mt-4">
        <span className="text-xs font-medium text-muted-foreground">Suggested problems</span>
        <ul className="mt-1.5 space-y-1 text-sm text-foreground/80 font-mono">
          {week.problems.map((p) => (
            <li key={p} className="text-xs">• {p}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          ~8 hrs
        </span>
      </div>
    </div>
  </div>
);

export default WeeklyPlan;
export { TopicChip };
