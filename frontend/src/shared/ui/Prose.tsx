type Props = {
  paragraphs: string[];
  extraClass?: string;
};

export function Prose({ paragraphs, extraClass }: Props) {
  return (
    <div
      className={`[&_p]:m-0 [&_p]:mb-[1.1em] [&_p]:font-sans [&_p]:text-base [&_p]:font-normal [&_p]:leading-[1.6] [&_p]:tracking-normal [&_p]:text-muted [&_p:last-child]:mb-0${extraClass ? ` ${extraClass}` : ""}`}
    >
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}
