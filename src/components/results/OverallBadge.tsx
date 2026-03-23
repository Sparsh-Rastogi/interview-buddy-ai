const getLabel = (score: number) => {
  if (score >= 90) return { text: 'Excellent', color: 'text-green' };
  if (score >= 70) return { text: 'Good', color: 'text-primary' };
  if (score >= 50) return { text: 'Needs Improvement', color: 'text-amber' };
  return { text: 'Weak', color: 'text-red' };
};

const OverallBadge = ({ score }: { score: number }) => {
  const label = getLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(240 4% 18%)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(239 84% 67%)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${label.color}`}>{label.text}</span>
    </div>
  );
};

export default OverallBadge;
