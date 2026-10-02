import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function TextInput({ className, invalid, ...props }: Props) {
  return (
    <input
      aria-invalid={invalid}
      className={`w-full rounded border-[1.5px] bg-white px-3 py-2.5 font-sans text-[15px] leading-[1.4] text-text-dark focus:outline-2 focus:outline-offset-[1px] ${
        invalid
          ? "border-danger focus:outline-danger"
          : "border-text-dark focus:outline-yellow"
      }${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
