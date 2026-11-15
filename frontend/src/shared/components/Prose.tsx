type Props = {
  paragraphs: string[];
  className?: string;
};

export function Prose({ paragraphs, className }: Props) {
  return (
    <div className={`detail-desc${className ? ` ${className}` : ""}`}>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
