import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { type NavLink, navLinks } from "./config/nav";

function activeLabel(pathname: string, links: NavLink[]): string {
  if (pathname === "/") return "menu";

  const exact = links.find((l) => l.path === pathname);
  if (exact) return exact.label;

  const nested = links.find(
    (l) => l.path !== "/" && pathname.startsWith(`${l.path}/`),
  );
  return nested?.label ?? "menu";
}

type Props = {
  links?: NavLink[];
  className?: string;
};

export function Navbar({ links = navLinks, className }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const active = activeLabel(pathname, links);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`flex items-center gap-[18px]${className ? ` ${className}` : ""}`}
      aria-label="Main"
    >
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-mono text-base leading-[1.2] text-text-dark hover:text-text"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((v) => !v)}
        >
          {active}
          <span className="text-[10px] opacity-70" aria-hidden>
            ▾
          </span>
        </button>
        <ul
          className={`absolute right-0 top-[calc(100%+8px)] m-0 min-w-40 list-none rounded-menu border border-border bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${
            open ? "block" : "hidden"
          }`}
          role="menu"
        >
          {links.map((l) => (
            <li key={l.path} role="none">
              <button
                type="button"
                role="menuitem"
                className={`block w-full cursor-pointer rounded border-none bg-transparent px-2.5 py-2 text-left font-mono text-base leading-[1.2] text-text-dark hover:bg-surface hover:text-text${
                  l.highlight ? " bg-yellow hover:bg-yellow" : ""
                }${pathname === l.path ? " font-medium" : ""}`}
                onClick={() => {
                  setOpen(false);
                  navigate(l.path);
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
