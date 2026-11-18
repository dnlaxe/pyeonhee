type Props = {
  tags: readonly string[];
  extraClass?: string;
};

export function TagList({ tags, extraClass }: Props) {
  if (tags.length === 0) return null;
  return (
    <div
      className={`flex flex-wrap gap-1.5 ${extraClass ? ` ${extraClass}` : ""}`}
    >
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center border-b border-text pb-0.5 text-xs leading-[1.2] text-text"
        >
          {t}
        </span>
      ))}
    </div>
  );
}