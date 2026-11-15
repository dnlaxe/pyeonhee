import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";
import { Logo } from "./Logo";
import { Navbar } from "./Navbar";

function detailBackTo(pathname: string): string | null {
  if (/^\/jobs\/[^/]+$/.test(pathname)) return "/?kind=job";
  if (/^\/market\/[^/]+$/.test(pathname)) return "/?kind=market";
  if (/^\/services\/[^/]+$/.test(pathname)) return "/?kind=service";
  return null;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const backTo = detailBackTo(pathname);

  return (
    <>
      <header className="site-bar relative z-[80]">
        <div className="mx-auto flex h-14 w-[min(100%-48px,1120px)] items-center justify-between max-md:w-[min(100%-32px,1120px)]">
          {backTo ? (
            <Link
              to={backTo}
              className="inline-flex shrink-0 items-center text-text no-underline"
              aria-label="Back to latest posts"
            >
              <ArrowLeftIcon />
            </Link>
          ) : (
            <Logo to="/" showWordmark={false} />
          )}
          <Navbar open={open} setOpen={setOpen} />
        </div>
      </header>

      <div
        className={`menu-overlay${open ? " is-open" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
