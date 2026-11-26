import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeftIcon } from "../icons/ArrowLeftIcon";
import { Logo } from "../icons/Logo";
import { Container } from "./Container";
import { Hamburger } from "./Hamburger";
import { MenuIsland, MenuOverlay } from "./MenuIsland";

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
      <header className="relative">
        <Container extraClass="flex h-14 items-center justify-between">
          {backTo ? (
            <Link
              to={backTo}
              className="icon-link inline-flex shrink-0 items-center"
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

              <MenuIsland
                open={open}
                onSelect={(path) => {
                  setOpen(false);
                  navigate(path);
                }}
              />
            </div>
          </nav>
        </Container>
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
