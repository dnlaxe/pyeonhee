import { Link } from "react-router";

type Props = {
  className?: string;
  "aria-label"?: string;
};

export function FaqHelpLink({
  className,
  "aria-label": ariaLabel = "About contact emails",
}: Props) {
  return (
    <Link
      to="/faq"
      className={`inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#a1a1aa] font-mono text-[13px] leading-none text-muted no-underline hover:border-muted hover:text-text-dark${
        className ? ` ${className}` : ""
      }`}
      aria-label={ariaLabel}
      onClick={(e) => e.stopPropagation()}
    >
      ?
    </Link>
  );
}
