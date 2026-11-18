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
      <span className=" text-sm leading-[1.2] text-text">
        {label}
      </span>
      {children}
      {error ? (
        <span className=" text-[13px] leading-[1.4] text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
