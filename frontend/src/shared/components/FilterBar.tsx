type Props = {
  filters: readonly string[];
  active: string | null;
  onChange: (tag: string) => void;
  className?: string;
};

export function FilterBar({ filters, active, onChange, className }: Props) {
  return (
    <div
      className={`flex flex-wrap gap-2 mb-3 border-t-4 border-yellow-accent pt-4 ${className ? ` ${className}` : ""}`}
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
