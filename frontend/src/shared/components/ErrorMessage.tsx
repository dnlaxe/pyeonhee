import { AppError } from "../../lib/httpError";

function errorStyle(error: Error): string {
  const tone = error instanceof AppError ? error.tone : "danger";

  switch (tone) {
    case "warning":
      return "text-amber-700";
    case "neutral":
      return "text-muted";
    case "danger":
    default:
      return "text-danger";
  }
}

/** Matches hero-banner-lead size (20px / 18px on narrow). */
const statusText =
  "m-0 text-[20px] font-normal leading-[1.2] tracking-normal max-[399px]:text-[18px]";

export function ErrorMessage({ error }: { error: Error }) {
  return <p className={`${statusText} ${errorStyle(error)}`}>{error.message}</p>;
}

export function LoadingMessage({ children = "Loading…" }: { children?: string }) {
  return <p className={`${statusText} text-muted`}>{children}</p>;
}
