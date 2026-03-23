import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OverallBadge from '@/components/results/OverallBadge';
import ScoreRadar from '@/components/results/ScoreRadar';
import FeedbackCard from '@/components/results/FeedbackCard';
import MistakesList from '@/components/results/MistakesList';
import { useInterviewStore } from '@/store/interviewStore';
import { endSession } from '@/api/client';
import { useEffect } from 'react';

const Results = () => {
  const { evaluation, setEvaluation, setRoadmap } = useInterviewStore();

  // Load mock data if navigated directly
  useEffect(() => {
    if (!evaluation) {
      endSession('mock').then((res) => {
        setEvaluation(res.evaluation);
        setRoadmap(res.roadmap);
      });
    }
  }, []);

  if (!evaluation) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-12 gradient-subtle">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <OverallBadge score={evaluation.overallScore} />
        </div>

        {/* Radar */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Performance Breakdown</h3>
          <ScoreRadar dimensions={evaluation.dimensions} />
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {evaluation.strengths.map((s) => (
                <span key={s} className="rounded-full bg-green/10 px-3 py-1 text-xs font-medium text-green">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Areas to Improve</h3>
            <div className="flex flex-wrap gap-2">
              {evaluation.mistakes.map((m) => (
                <span key={m} className="rounded-full bg-red/10 px-3 py-1 text-xs font-medium text-red">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Per-question */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Question-by-Question Feedback</h3>
          <FeedbackCard feedback={evaluation.feedback} />
        </div>

        {/* Mistakes */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Mistakes & Misconceptions</h3>
          <MistakesList mistakes={evaluation.mistakes} />
        </div>

        {/* CTAs */}
        <div className="flex justify-center gap-4">
          <Link to="/roadmap">
            <Button className="gap-2">
              View Roadmap <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/onboarding">
            <Button variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> New Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
