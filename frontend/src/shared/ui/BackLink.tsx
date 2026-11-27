import { Link } from "react-router";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";

type Props = {
  to: string;
  children: React.ReactNode;
};

export function BackLink({ to, children }: Props) {
  return (
    <Link to={to} className="icon-link inline-flex shrink-0">
      <ArrowLeftIcon />
      <span className="sr-only">{children}</span>
    </Link>
  );
}
