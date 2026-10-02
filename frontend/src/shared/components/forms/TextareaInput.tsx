import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function TextareaInput({ className, invalid, ...props }: Props) {
  return (
    <textarea
      aria-invalid={invalid}
      className={`min-h-[140px] w-full resize-y rounded border-[1.5px] bg-white px-3 py-2.5 font-sans text-[15px] leading-[1.4] text-text-dark focus:outline-2 focus:outline-offset-[1px] ${
        invalid
          ? "border-danger focus:outline-danger"
          : "border-text-dark focus:outline-yellow"
      }${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
