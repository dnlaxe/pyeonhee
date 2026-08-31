import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function SelectInput({ className, ...props }: Props) {
  return (
    <select
      className={`select-input w-full rounded border-[1.5px] border-text-dark bg-white px-3 py-2.5 font-sans text-[15px] leading-[1.4] text-text-dark focus:outline-2 focus:outline-offset-[1px] focus:outline-yellow${
        className ? ` ${className}` : ""
      }`}
      {...props}
    />
  );
}
