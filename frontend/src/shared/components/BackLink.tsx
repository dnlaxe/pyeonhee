import { Link } from "react-router";

type Props = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

export function BackLink({ to, children, className }: Props) {
  return (
    <Link
      to={to}
      className={`mb-7 inline-block font-mono text-sm leading-[1.2] text-muted hover:text-text-dark${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </Link>
  );
}
