import styles from "./Hamburger.module.css";

type Props = {
  open: boolean;
  onToggle: () => void;
  extraClass?: string;
};

export function Hamburger({ open, onToggle, extraClass }: Props) {
  return (
    <button
      type="button"
      className={`${styles.hb} ${styles.hbToX}${extraClass ? ` ${extraClass}` : ""}`}
      aria-label="Menu"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls="site-menu"
      onClick={onToggle}
    >
      <span className={styles.hbBars} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
