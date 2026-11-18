type Props = {
  extraClass?: string;
};

export function LogoPlaceholder({ extraClass }: Props) {
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className={extraClass}
    >
      <path
        d="M1 11C1 16.5 11 16.5 11 11C11 5.5 21 5.5 21 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
