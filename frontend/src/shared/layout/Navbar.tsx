import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { navLinks } from "../../config";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";
import { Logo } from "../icons/Logo";
import { Hamburger } from "./Hamburger";
import menu from "./MenuIsland.module.css";

function detailBackTo(pathname: string, state: unknown): string | null {
  const isDetail =
    /^\/jobs\/[^/]+$/.test(pathname) ||
    /^\/market\/[^/]+$/.test(pathname) ||
    /^\/services\/[^/]+$/.test(pathname);
  if (!isDetail) return null;

  if (
    typeof state === "object" &&
    state !== null &&
    "backTo" in state &&
    typeof state.backTo === "string" &&
    (state.backTo === "/" || state.backTo.startsWith("/?"))
  ) {
    return state.backTo;
  }

  if (/^\/jobs\/[^/]+$/.test(pathname)) return "/?kind=job";
  if (/^\/market\/[^/]+$/.test(pathname)) return "/?kind=market";
  return "/?kind=service";
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname, state } = useLocation();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const backTo = detailBackTo(pathname, state);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="relative z-[80]">
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

          <nav className="flex items-center gap-[18px]" aria-label="Main">
            <div className="relative" ref={dropdownRef}>
              <Hamburger
                open={open}
                onToggle={() => setOpen((v) => !v)}
                extraClass="relative z-71"
              />

              <div
                id="site-menu"
                className={`${menu.island}${open ? ` ${menu.isOpen}` : ""}`}
                role="menu"
                aria-hidden={!open}
              >
                <ul className={menu.list}>
                  {navLinks.map((l) => (
                    <li key={l.path} role="none">
                      <button
                        type="button"
                        role="menuitem"
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
            </div>
          </nav>
        </div>
      </header>

      <div
        className={`${menu.overlay}${open ? ` ${menu.isOpen}` : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
