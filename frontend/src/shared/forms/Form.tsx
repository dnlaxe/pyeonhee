import type { ReactNode, FormHTMLAttributes } from "react";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "className"> & {
  children: ReactNode;
  extraClass?: string;
};

export function Form({ children, onSubmit, extraClass, ...props }: Props) {
  return (
    <form
      className={`flex flex-col gap-5${extraClass ? ` ${extraClass}` : ""}`}
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
