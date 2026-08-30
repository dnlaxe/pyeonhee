import { Link } from "react-router";

type Props = {
  to: string;
};

export function ReportLink({ to }: Props) {
  return (
    <Link
      to={to}
      className="mt-4 block w-fit text-left font-mono text-[13px] leading-[1.2] text-[#a1a1aa] no-underline hover:text-muted hover:underline"
    >
      report this post
    </Link>
  );
}
