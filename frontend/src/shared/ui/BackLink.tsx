import { Link } from "react-router";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";

type Props = {
  to: string;
  children: React.ReactNode;
  extraClass?: string;
};

export function BackLink({ to, children, extraClass }: Props) {
  return (
    <Link
      to={to}
      className={
        extraClass ?? "mb-7 inline-flex shrink-0 text-text"
      }
    >
      <ArrowLeftIcon />
      <span className="sr-only">{children}</span>
    </Link>
  );
}
