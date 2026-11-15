import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

const variants = {
  accent:
    "inline-flex cursor-pointer items-center justify-center rounded-none border-[1.5px] border-text bg-accent px-7 py-3 text-base font-normal leading-[1.2] text-text hover:bg-accent-hover tracking-normal",
  "accent-lg":
    "inline-flex min-w-[140px] cursor-pointer items-center justify-center rounded-none border-[1.5px] border-text bg-accent px-7 py-3.5 font-sans text-[20px] font-normal leading-[1.2] tracking-normal text-text no-underline hover:bg-accent-hover max-[399px]:text-[18px]",
  outline:
    "inline-flex items-center justify-center rounded-none border-[1.5px] border-text bg-transparent px-7 py-3 font-sans text-base font-normal leading-[1.2] text-text no-underline hover:bg-accent",
  "more-lg":
    "mx-auto mt-7 flex w-fit cursor-pointer items-center justify-center rounded-none border-[1.5px] border-text bg-transparent px-7 py-3.5 text-lg font-normal leading-[1.2] tracking-normal text-text no-underline hover:bg-accent",
  post:
    "inline-flex shrink-0 items-center justify-center rounded-none border-[1.5px] border-text bg-white px-7 py-3.5 text-[20px] font-normal leading-[1.2] tracking-normal text-text no-underline hover:bg-surface max-[399px]:text-[18px]",
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
  const { variant = "accent", className, children, ...rest } = props;
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
