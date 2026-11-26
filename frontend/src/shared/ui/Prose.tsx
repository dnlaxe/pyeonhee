type Props = {
  paragraphs: string[];
  extraClass?: string;
};

export function Prose({ paragraphs, extraClass }: Props) {
  return (
    <div className={`prose${extraClass ? ` ${extraClass}` : ""}`}>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
