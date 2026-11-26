type Props = {
  tags: readonly string[];
  extraClass?: string;
};

export function TagList({ tags, extraClass }: Props) {
  if (tags.length === 0) return null;
  return (
    <div
      className={`flex flex-wrap gap-1.5${extraClass ? ` ${extraClass}` : ""}`}
    >
      {tags.map((t) => (
        <span key={t} className="tag-item inline-flex items-center">
          {t}
        </span>
      ))}
    </div>
  );
}