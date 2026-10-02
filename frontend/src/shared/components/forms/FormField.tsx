import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
  error?: string;
};

export function FormField({ label, children, className, error }: Props) {
  return (
    <label className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      <span className="font-mono text-sm leading-[1.2] text-text-dark">
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-[13px] leading-[1.4] text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
