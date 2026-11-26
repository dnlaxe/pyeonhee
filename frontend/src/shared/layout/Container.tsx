import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  narrow?: boolean;
  extraClass?: string;
};

export function Container({ children, narrow = false, extraClass }: Props) {
  const classes = [
    "page-container",
    narrow ? "page-narrow" : "",
    extraClass ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
