import { Link } from "react-router";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";

type Props = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

export function BackLink({ to, children, className }: Props) {
  return (
    <Link
      to={to}
      className={`mb-7 inline-flex text-text-dark${
        className ? ` ${className}` : ""
      }`}
    >
      <ArrowLeftIcon />
      <span className="sr-only">{children}</span>
    </Link>
  );
}