import { useState } from "react";
import { useLocation } from "react-router";
import { Logo } from "./Logo";
import { Navbar } from "./Navbar";

export function Header() {
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();
  const subtitle =
    pathname === "/jobs"
      ? "job board"
      : pathname === "/market"
        ? "market"
        : pathname === "/services"
          ? "services"
          : undefined;

  return (
    <>
      <header className="sticky top-0 z-[80] border-b border-transparent bg-[rgba(250,250,250,0.86)] backdrop-blur-[10px]">
        <div className="mx-auto flex min-h-16 w-[min(100%-48px,1120px)] items-center justify-between max-md:w-[min(100%-32px,1120px)]">
          <Logo to="/" subtitle={subtitle} />
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