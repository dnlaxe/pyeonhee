import type { SelectHTMLAttributes } from "react";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  invalid?: boolean;
  extraClass?: string;
};

export function SelectInput({ extraClass, invalid, ...props }: Props) {
  return (
    <select
      aria-invalid={invalid}
      className={`field-select select-input w-full${
        invalid ? " field-invalid" : ""
      }${extraClass ? ` ${extraClass}` : ""}`}
      {...props}
    />
  );
}
