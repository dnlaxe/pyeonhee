import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  invalid?: boolean;
  extraClass?: string;
};

export function TextInput({ extraClass, invalid, ...props }: Props) {
  return (
    <input
      aria-invalid={invalid}
      className={`field-input w-full${invalid ? " field-invalid" : ""}${
        extraClass ? ` ${extraClass}` : ""
      }`}
      {...props}
    />
  );
}
