type Props = {
  tags: readonly string[];
  className?: string;
};

export function TagList({ tags, className }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className={`detail-tags${className ? ` ${className}` : ""}`}>
      {tags.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}
