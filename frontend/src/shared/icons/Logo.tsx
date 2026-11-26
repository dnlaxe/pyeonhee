import { Link } from "react-router";

export function LogoMark({ extraClass }: { extraClass?: string }) {
  return (
    <span
      className={`logo-mark relative shrink-0${
        extraClass ? ` ${extraClass}` : ""
      }`}
      aria-hidden
    >
      <svg viewBox="0 0 22 22" fill="none">
        <path
          d="M1 11C1 16.5 11 16.5 11 11C11 5.5 21 5.5 21 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

type Props = {
  to?: string;
  showWordmark?: boolean;
  extraClass?: string;
};

export function Logo({ to = "/", showWordmark = true, extraClass }: Props) {
  const inner = (
    <>
      <LogoMark />
      {showWordmark ? (
        <span className="logo-wordmark">
          pyeonhee
        </span>
      ) : null}
    </>
  );

  const logoClass = `logo-link inline-flex items-center gap-2${
    extraClass ? ` ${extraClass}` : ""
  }`;

  if (to) {
    return (
      <Link to={to} className={logoClass}>
        {inner}
      </Link>
    );
  }

  return <span className={logoClass}>{inner}</span>;
}
