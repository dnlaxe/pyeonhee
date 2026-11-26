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
    <div role="alert" className="alert-error">
      {text}
    </div>
  );
}
