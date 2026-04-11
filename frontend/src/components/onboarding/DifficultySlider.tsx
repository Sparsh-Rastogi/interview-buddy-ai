interface DifficultySliderProps {
  value: 'easy' | 'medium' | 'hard';
  onChange: (value: 'easy' | 'medium' | 'hard') => void;
}

const levels = [
  { key: 'easy' as const, label: 'Easy', desc: 'Concept-level, entry questions' },
  { key: 'medium' as const, label: 'Medium', desc: 'Problem-solving, moderate depth' },
  { key: 'hard' as const, label: 'Hard', desc: 'Deep CS, edge cases, design trade-offs' },
];

const DifficultySlider = ({ value, onChange }: DifficultySliderProps) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {levels.map((l) => (
      <button
        key={l.key}
        onClick={() => onChange(l.key)}
        className={`rounded-lg border p-4 text-left transition-all ${
          value === l.key
            ? 'border-primary bg-primary/10'
            : 'border-border bg-card hover:border-muted-foreground'
        }`}
      >
        <span className="text-sm font-medium text-foreground">{l.label}</span>
        <p className="mt-1 text-xs text-muted-foreground">{l.desc}</p>
      </button>
    ))}
  </div>
);

export default DifficultySlider;
