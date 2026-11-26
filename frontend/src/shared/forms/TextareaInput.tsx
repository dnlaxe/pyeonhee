import type { TextareaHTMLAttributes } from "react";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  invalid?: boolean;
  extraClass?: string;
};

export function TextareaInput({ extraClass, invalid, ...props }: Props) {
  return (
    <textarea
      aria-invalid={invalid}
      className={`field-textarea w-full${invalid ? " field-invalid" : ""}${
        extraClass ? ` ${extraClass}` : ""
      }`}
      {...props}
    />
  );
}
