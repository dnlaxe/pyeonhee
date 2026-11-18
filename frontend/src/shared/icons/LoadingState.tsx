
export function LoadingState({
  color = "var(--color-accent)",
  size = 80,
  extraClass = "",
}: {
  color?: string;
  size?: number;
  extraClass?: string;
}) {
  const pathD = "M 32 104 A 34 34 0 0 0 100 104 A 34 34 0 0 1 168 104";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="status"
      aria-label="Loading"
      className={extraClass}
    >
      <style>{`
        .logo-pulse {
          stroke-dasharray: 75 265;
          stroke-dashoffset: 75;
          animation: logoPulse 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes logoPulse {
          0% {
            stroke-dashoffset: 75;
          }
          100% {
            stroke-dashoffset: -265;
          }
        }
      `}</style>

      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeOpacity={0.16}
        strokeWidth={16}
        strokeLinecap="round"
      />

      <path
        className="logo-pulse"
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={16}
        strokeLinecap="round"
      />
    </svg>
  );
}