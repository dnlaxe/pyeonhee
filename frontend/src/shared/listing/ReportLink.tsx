import { Link } from "react-router";

type Props = {
  kind: string;
  id: string;
};

export function ReportLink({ kind, id }: Props) {
  return (
    <Link
      to={`/report/${kind}/${id}`}
      className="mt-4 block w-fit text-left font-mono text-[13px] leading-[1.2] text-[#a1a1aa] no-underline hover:text-muted hover:underline"
    >
      report this post
    </Link>
  );
}
