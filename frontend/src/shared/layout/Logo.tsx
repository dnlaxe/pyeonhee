import { Link } from "react-router";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={`relative size-[22px] shrink-0 overflow-hidden rounded-full border-2 border-[#111]${
        className ? ` ${className}` : ""
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
          stroke="#111"
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
  className?: string;
};

export function Logo({ to = "/", showWordmark = true, className }: Props) {
  const inner = (
    <>
      <LogoMark />
      {showWordmark && (
        <span className="font-mono text-base leading-[1.2] text-black">
          pyeonhee
        </span>
      )}
    </>
  );

  const logoClass = `inline-flex items-center gap-2.5 text-text-dark no-underline${
    className ? ` ${className}` : ""
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
