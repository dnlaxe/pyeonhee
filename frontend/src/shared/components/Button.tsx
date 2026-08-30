import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

const variants = {
  yellow:
    "inline-flex cursor-pointer items-center justify-center rounded border-[1.5px] border-text-dark bg-yellow px-7 py-3 font-mono text-base leading-[1.2] text-text-dark hover:bg-yellow-accent",
  "yellow-lg":
    "inline-flex min-w-[140px] items-center justify-center rounded border-[1.5px] border-text-dark bg-yellow px-7 py-3.5 font-mono text-base leading-[1.2] text-text-dark no-underline hover:bg-yellow-accent",
  outline:
    "inline-flex items-center justify-center rounded border-[1.5px] border-text-dark bg-transparent px-7 py-3 font-mono text-base leading-[1.2] text-text-dark no-underline hover:bg-yellow",
  more: "mx-auto mt-3 flex w-fit cursor-pointer items-center justify-center rounded border-[1.5px] border-text-dark bg-transparent px-7 py-3.5 font-mono text-lg leading-[1.2] text-text-dark no-underline hover:bg-yellow",
  "more-lg":
    "mx-auto mt-7 flex w-fit cursor-pointer items-center justify-center rounded border-[1.5px] border-text-dark bg-transparent px-7 py-3.5 font-mono text-lg leading-[1.2] text-text-dark hover:bg-yellow",
} as const;

type Variant = keyof typeof variants;

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type AsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };

type AsLink = BaseProps &
  Omit<LinkProps, "className" | "children"> & { to: string };

export function Button(props: AsButton | AsLink) {
  const { variant = "yellow", className, children, ...rest } = props;
  const classes = `${variants[variant]}${className ? ` ${className}` : ""}`;

  if ("to" in props && props.to) {
    const { to, variant: _v, ...linkRest } = rest as AsLink;
    return (
      <Link to={to} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  const { type = "button", ...buttonProps } = buttonRest;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
