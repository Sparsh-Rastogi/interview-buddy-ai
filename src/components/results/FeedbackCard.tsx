import type { QuestionFeedback } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const verdictStyle = {
  strong: 'bg-green/15 text-green',
  adequate: 'bg-amber/15 text-amber',
  weak: 'bg-red/15 text-red',
};

const FeedbackCard = ({ feedback }: { feedback: QuestionFeedback[] }) => (
  <Accordion type="multiple" className="space-y-2">
    {feedback.map((f, i) => (
      <AccordionItem key={i} value={`q-${i}`} className="rounded-lg border border-border bg-card px-4">
        <AccordionTrigger className="text-sm text-foreground text-left hover:no-underline gap-3">
          <div className="flex flex-1 items-center gap-3">
            <span className="flex-1 font-mono text-xs">{f.question}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${verdictStyle[f.verdict]}`}>
              {f.verdict}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-4 text-sm">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Your answer</span>
            <p className="mt-1 text-foreground/80 font-mono text-xs leading-relaxed">{f.userAnswer}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Notes</span>
            <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{f.notes}</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default FeedbackCard;
