type Props = {
  paragraphs: string[];
  className?: string;
};

export function Prose({ paragraphs, className }: Props) {
  return (
    <div
      className={`[&_p]:mb-[1.1em] [&_p]:text-[15px] [&_p]:leading-normal [&_p]:text-body [&_p:last-child]:mb-0${
        className ? ` ${className}` : ""
      }`}
    >
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
