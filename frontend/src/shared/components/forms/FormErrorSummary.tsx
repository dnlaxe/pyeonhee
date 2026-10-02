type Props = {
  count: number;
};

export function FormErrorSummary({ count }: Props) {
  if (count === 0) return null;

  const text =
    count === 1
      ? "1 field still needs a fix."
      : `${count} fields still need a fix.`;

  return (
    <div
      role="alert"
      className="border-[1.5px] border-text-dark bg-danger/70 px-3 py-2.5 font-mono text-sm leading-[1.4] text-text-dark rounded-lg"
    >
      {text}
    </div>
  );
}
