import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, children, className }: Props) {
  return (
    <label className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      <span className="font-mono text-sm leading-[1.2] text-text-dark">
        {label}
      </span>
      {children}
    </label>
  );
}
