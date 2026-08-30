import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Tag({ children, className }: Props) {
  return (
    <span
      className={`rounded border border-text-dark px-2 py-1 font-mono text-xs leading-[1.2] text-text-dark${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </span>
  );
}
