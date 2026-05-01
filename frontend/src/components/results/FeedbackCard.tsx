import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FeedbackData = {
  overallScore: number;
  dimensions: Record<string, number>;
  feedback: string;
  mistakes: string[];
  strengths: string[];
};

const FeedbackCard = ({ data }: { data: FeedbackData }) => {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* 🔹 Overall Feedback */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Overall Feedback</h3>
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {data.feedback}
        </p>
      </div>

      {/* 🔹 Mistakes */}
      {Array.isArray(data.mistakes) && data.mistakes.length > 0 && (
        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="mistakes" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-sm font-medium text-red">
              Mistakes
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ul className="list-disc pl-4 space-y-2 text-xs text-muted-foreground">
                {data.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* 🔹 Strengths */}
      {Array.isArray(data.strengths) && data.strengths.length > 0 && (
        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="strengths" className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-sm font-medium text-green">
              Strengths
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ul className="list-disc pl-4 space-y-2 text-xs text-muted-foreground">
                {data.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* 🔹 Score Breakdown */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Score Breakdown</h3>

        <div className="space-y-2 text-xs">
          {Object.entries(data.dimensions || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between text-muted-foreground">
              <span className="capitalize">{key}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-border pt-2 flex justify-between text-sm font-semibold">
          <span>Overall</span>
          <span>{data.overallScore}</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;