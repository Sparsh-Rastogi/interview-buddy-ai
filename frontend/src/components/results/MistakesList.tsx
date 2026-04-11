const MistakesList = ({ mistakes }: { mistakes: string[] }) => (
  <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground/80">
    {mistakes.map((m, i) => (
      <li key={i} className="leading-relaxed">{m}</li>
    ))}
  </ol>
);

export default MistakesList;
