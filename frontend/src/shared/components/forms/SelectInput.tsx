import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function SelectInput({ className, invalid, ...props }: Props) {
  return (
    <select
      aria-invalid={invalid}
      className={`select-input w-full rounded border-[1.5px] bg-white px-3 py-2.5 font-sans text-[15px] leading-[1.4] text-text-dark focus:outline-2 focus:outline-offset-[1px] ${
        invalid
          ? "border-danger focus:outline-danger"
          : "border-text-dark focus:outline-yellow"
      }${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
