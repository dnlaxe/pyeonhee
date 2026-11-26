import { navLinks } from "../../config";
import menu from "./MenuIsland.module.css";

type IslandProps = {
  open: boolean;
  onSelect: (path: string) => void;
};

export function MenuIsland({ open, onSelect }: IslandProps) {
  return (
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
              className={l.accent ? menu.accentItem : undefined}
              onClick={() => onSelect(l.path)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type OverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function MenuOverlay({ open, onClose }: OverlayProps) {
  return (
    <div
      className={`${menu.overlay}${open ? ` ${menu.isOpen}` : ""}`}
      aria-hidden={!open}
      onClick={onClose}
    />
  );
}
