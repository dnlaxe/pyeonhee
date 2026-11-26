import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

type Variant = "primary" | "secondary";

type SharedProps = {
  variant?: Variant;
  extraClass?: string;
  children: ReactNode;
};

type LinkButtonProps = SharedProps & {
  to: string;
};

type NativeButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    to?: undefined;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  const classes = `${variantClass} inline-flex items-center justify-center${
    props.extraClass ? ` ${props.extraClass}` : ""
  }`;

  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {props.children}
      </Link>
    );
  }

  const { type = "button", children, ...rest } = props;
  delete rest.variant;
  delete rest.extraClass;
  delete rest.to;

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
