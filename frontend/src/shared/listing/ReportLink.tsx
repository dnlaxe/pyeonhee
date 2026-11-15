import { Link } from "react-router";

type Props = {
  kind: string;
  id: string;
};

export function ReportLink({ kind, id }: Props) {
  return (
    <p className="mt-4 m-0">
      <Link
        to={`/report/${kind}/${id}`}
        className="text-[13px] text-muted underline underline-offset-[3px]"
      >
        report this post
      </Link>
    </p>
  );
}
