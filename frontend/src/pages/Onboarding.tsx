import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResumeUploader from '@/components/onboarding/ResumeUploader';
import RoleSelector from '@/components/onboarding/RoleSelector';
import DifficultySlider from '@/components/onboarding/DifficultySlider';
import { useInterviewStore } from '@/store/interviewStore';

const durations = [15, 30, 45];

const Onboarding = () => {
  const navigate = useNavigate();
  const setCandidateProfile = useInterviewStore((s) => s.setCandidateProfile);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [duration, setDuration] = useState(30);

  const handleStart = () => {
    setCandidateProfile({
      resumeFile: file,
      targetRole: role || 'Software Engineer',
      difficulty,
      skills: [],
      duration,
    });
    navigate('/interview');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 gradient-subtle">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-px w-8 transition-colors ${step > s ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
          <span className="ml-3 text-xs text-muted-foreground">Step {step} of 3</span>
        </div>

        {/* Steps */}
        <div className="rounded-lg border border-border bg-card p-6 animate-fade-in">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upload your resume</h2>
              <p className="mt-1 text-sm text-muted-foreground">We'll tailor questions to your experience.</p>
              <div className="mt-6">
                <ResumeUploader file={file} onFileChange={setFile} />
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-4 text-xs text-muted-foreground underline hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
              <p className="mt-1 text-sm text-muted-foreground">Customize your interview.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Target Role</label>
                  <RoleSelector value={role} onChange={setRole} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Difficulty</label>
                  <DifficultySlider value={difficulty} onChange={setDifficulty} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Duration</label>
                  <div className="flex gap-2">
                    {durations.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                          duration === d
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">Confirm & Start</h2>
              <p className="mt-1 text-sm text-muted-foreground">Review your settings.</p>

              <div className="mt-6 space-y-3 rounded-md border border-border bg-muted/30 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="text-foreground">{role || 'Software Engineer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="capitalize text-foreground">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">{duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resume</span>
                  <span className="text-foreground">{file ? file.name : 'Not uploaded'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleStart}>
              Start Interview <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
