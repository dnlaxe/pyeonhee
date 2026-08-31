import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: Props) {
  return (
    <input
      className={`w-full rounded border-[1.5px] border-text-dark bg-white px-3 py-2.5 font-sans text-[15px] leading-[1.4] text-text-dark focus:outline-2 focus:outline-offset-[1px] focus:outline-yellow${
        className ? ` ${className}` : ""
      }`}
      {...props}
    />
  );
}
