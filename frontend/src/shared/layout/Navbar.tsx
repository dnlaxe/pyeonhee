import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router";
import { type NavLink, navLinks } from "./config/nav";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  links?: NavLink[];
  className?: string;
};

export function Navbar({
                         open,
                         setOpen,
                         links = navLinks,
                         className,
                       }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  }, [open, setOpen]);

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <nav
      className={`flex items-center gap-[18px]${className ? ` ${className}` : ""}`}
      aria-label="Main"
    >
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="hb hb-to-x relative z-[71]"
          aria-label="Menu"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hb-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <div
          id="site-menu"
          className={`menu-island${open ? " is-open" : ""}`}
          role="menu"
          aria-hidden={!open}
        >
          <ul className="menu-island-list">
            {links.map((l) => (
              <li key={l.path} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`${l.highlight ? "is-post" : ""}${
                    pathname === l.path ? " font-medium" : ""
                  }`.trim()}
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
  );
}