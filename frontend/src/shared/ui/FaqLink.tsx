import { Link } from "react-router";

type Props = {
  children: React.ReactNode;
  extraClass?: string;
};

export function FaqLink({ children, extraClass }: Props) {
  return (
    <Link
      to="/faq"
      className={`text-text underline underline-offset-[3px]${
        extraClass ? ` ${extraClass}` : ""
      }`}
    >
      {children}
    </Link>
  );
}
