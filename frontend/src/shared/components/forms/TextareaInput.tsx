import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaInput({ className, ...props }: Props) {
  return (
    <textarea
      className={`min-h-[140px] w-full resize-y rounded border-[1.5px] border-text-dark bg-white px-3 py-2.5 font-sans text-[15px] leading-[1.4] text-text-dark focus:outline-2 focus:outline-offset-[1px] focus:outline-yellow${
        className ? ` ${className}` : ""
      }`}
      {...props}
    />
  );
}
