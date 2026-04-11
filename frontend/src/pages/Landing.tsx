import { Link } from 'react-router-dom';
import { ArrowRight, FileText, MessageSquare, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: FileText,
    title: 'Resume-aware questions',
    description: 'Questions tailored to your actual projects and experience.',
  },
  {
    icon: MessageSquare,
    title: 'Cross-questioning',
    description: 'Follow-up probing like a real interviewer — no surface-level answers.',
  },
  {
    icon: BarChart3,
    title: 'Detailed feedback',
    description: 'Scores, mistakes, and a weekly roadmap to level up fast.',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Prep<span className="text-primary">AI</span>
          </span>
          <Link to="/onboarding">
            <Button size="sm">Start Interview</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center gradient-hero">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-2xl animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Prep<span className="text-primary">AI</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Simulate real technical interviews.
            <br />
            Get brutally honest feedback.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="mt-8 gap-2 text-base">
              Start Interview <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
