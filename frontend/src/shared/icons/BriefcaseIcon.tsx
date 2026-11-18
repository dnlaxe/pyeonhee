type Props = {
  extraClass?: string;
  size?: number;
  strokeWidth?: number | string;
};

export function BriefcaseIcon({ extraClass, size = 22, strokeWidth = 2 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={extraClass}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}