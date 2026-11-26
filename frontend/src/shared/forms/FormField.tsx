import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  extraClass?: string;
  error?: string;
};

export function FormField({ label, children, extraClass, error }: Props) {
  return (
    <label className={`flex flex-col gap-2${extraClass ? ` ${extraClass}` : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
