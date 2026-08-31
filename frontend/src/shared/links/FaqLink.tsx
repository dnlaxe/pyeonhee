import { Link } from "react-router";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function FaqLink({ children, className }: Props) {
  return (
    <Link
      to="/faq"
      className={`text-text-dark underline underline-offset-[3px]${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </Link>
  );
}
