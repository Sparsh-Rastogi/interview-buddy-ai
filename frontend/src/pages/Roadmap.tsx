import { Link } from 'react-router-dom';
import {downloadRoadmapPDF} from '@/utils/exportPDF';
import {downloadEvaluationPDF} from '@/utils/exportEval';
import { Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeeklyPlan from '@/components/roadmap/WeeklyPlan';
import { useInterviewStore } from '@/store/interviewStore';
import { endSession } from '@/api/client';
import { useEffect } from 'react';

const Roadmap = () => {
  const { evaluation, roadmap, setRoadmap, setEvaluation } = useInterviewStore();

  useEffect(() => {
    if (roadmap.length === 0) {
      endSession('mock').then((res) => {
        setRoadmap(res.roadmap);
        setEvaluation(res.evaluation);
      });
    }
  }, []);

  if (roadmap.length === 0) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-12 gradient-subtle">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-foreground">Your personalised roadmap</h1>
          <p className="mt-2 text-sm text-muted-foreground">Based on your interview performance</p>
        </div>

        <div className="space-y-0">
          {roadmap.map((w) => (
            <WeeklyPlan key={w.week} week={w} />
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" className="gap-2" onClick={() => downloadRoadmapPDF({ roadmap})}>
            <Download className="h-4 w-4" /> Download as PDF
          </Button>
          <Button variant="ghost" className="gap-2" onClick={() => downloadEvaluationPDF(evaluation)}>
            <Download className="h-4 w-4" /> Download Interview Summary
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
