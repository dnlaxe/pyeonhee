import { Link } from "react-router";

export function LogoMark({ extraClass }: { extraClass?: string }) {
  return (
    <span
      className={`relative size-5.5 shrink-0 overflow-hidden rounded-full border-2 border-text text-text${
        extraClass ? ` ${extraClass}` : ""
      }`}
      aria-hidden
    >
      <svg
        className="absolute -inset-0.5 block size-[calc(100%+4px)]"
        viewBox="0 0 22 22"
        fill="none"
      >
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
        <span className="font-sans text-lg font-normal leading-[1.2] text-text">
          pyeonhee
        </span>
      ) : null}
    </>
  );

  const logoClass = `inline-flex items-center gap-2 text-text no-underline${
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
