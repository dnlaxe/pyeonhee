import type { ReactNode, FormHTMLAttributes } from "react";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export function Form({ children, onSubmit, className, ...props }: Props) {
  return (
    <form
      className={`flex flex-col gap-5${className ? ` ${className}` : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...props}
    >
      {children}
    </form>
  );
}
