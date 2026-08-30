type Props = {
  filters: readonly string[];
  active: string | null;
  onChange: (tag: string) => void;
  spacing?: "default" | "loose";
  className?: string;
};

export function FilterBar({
  filters,
  active,
  onChange,
  spacing = "default",
  className,
}: Props) {
  const spacingClass =
    spacing === "default" ? "mb-3 mt-5 max-[900px]:mb-0" : "mb-9 mt-5";

  return (
    <div
      className={`flex flex-wrap gap-2 ${spacingClass}${className ? ` ${className}` : ""}`}
    >
      {filters.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`cursor-pointer rounded border-[1.5px] border-text-dark bg-transparent px-3 py-1.75 font-mono text-xs text-text-dark${
            active === tag ? " bg-yellow text-[#111]" : ""
          }`}
          onClick={() => onChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
