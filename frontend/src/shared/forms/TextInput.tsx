import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  invalid?: boolean;
  extraClass?: string;
};

export function TextInput({ extraClass, invalid, ...props }: Props) {
  return (
    <input
      aria-invalid={invalid}
      className={`w-full rounded-none border-[1.5px] bg-bg px-3 py-2.5 text-[15px] leading-[1.4] text-text focus:outline-2 focus:outline-offset-[1px] ${
        invalid
          ? "border-danger focus:outline-danger"
          : "border-text focus:outline-accent"
      }${extraClass ? ` ${extraClass}` : ""}`}
      {...props}
    />
  );
}
