import type { TextareaHTMLAttributes } from "react";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  invalid?: boolean;
  extraClass?: string;
};

export function TextareaInput({ extraClass, invalid, ...props }: Props) {
  return (
    <textarea
      aria-invalid={invalid}
      className={`min-h-[140px] w-full resize-y rounded-none border-[1.5px] bg-bg px-3 py-2.5 text-[15px] leading-[1.4] text-text focus:outline-2 focus:outline-offset-[1px] ${
        invalid
          ? "border-danger focus:outline-danger"
          : "border-text focus:outline-accent"
      }${extraClass ? ` ${extraClass}` : ""}`}
      {...props}
    />
  );
}
