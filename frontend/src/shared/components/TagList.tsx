import { Tag } from "./Tag";

type Props = {
  tags: readonly string[];
  className?: string;
};

export function TagList({ tags, className }: Props) {
  return (
    <div
      className={`flex flex-wrap gap-1.5${className ? ` ${className}` : ""}`}
    >
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </div>
  );
}
