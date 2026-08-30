import { Link } from "react-router";
import { footerLinks, footerTagline } from "./config/footer";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-transparent to-yellow/30 px-0 py-16 pb-12">
      <div className="mx-auto flex w-[min(100%-48px,1120px)] flex-col items-center gap-4 text-center max-md:w-[min(100%-32px,1120px)]">
        <Logo to="/" />
        <p className="m-0 max-w-[36ch] text-[15px] leading-normal text-body">
          {footerTagline}
        </p>
        <nav
          className="mt-2 flex flex-wrap items-center justify-center gap-x-[18px] gap-y-2"
          aria-label="Footer"
        >
          {footerLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={
                l.to === "/post"
                  ? "inline-flex items-center justify-center rounded px-2.5 py-1 font-mono text-sm leading-none text-text-dark border border-text-dark bg-yellow hover:bg-yellow-accent"
                  : "inline-flex items-center justify-center rounded px-2.5 py-1 font-mono text-sm leading-none text-text-dark border border-transparent hover:underline hover:underline-offset-[3px]"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
