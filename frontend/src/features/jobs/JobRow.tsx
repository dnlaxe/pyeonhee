import { Link } from "react-router";
import { TagList, formatTimeSince } from "../../shared";
import type { Job } from "./data";
import styles from "./JobRow.module.css";

export function JobRow({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`${styles.row} group cursor-pointer border-b border-border py-7 text-inherit no-underline`}
    >
      <div
        className="grid size-12 shrink-0 place-items-center rounded-full bg-yellow font-mono text-base font-medium leading-normal text-text-dark"
        aria-hidden
      >
        {job.initials}
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
          <h3 className="m-0 text-base font-semibold leading-[1.2] text-text-dark group-hover:underline group-hover:underline-offset-[3px]">
            {job.title}
          </h3>
          <span className="font-mono text-sm font-normal leading-[1.2] text-muted">
            [{formatTimeSince(job.createdAt)}]
          </span>
        </div>
        <p className="m-0 line-clamp-2 text-sm font-normal leading-[1.2] text-body">
          {job.description.replace(/\n+/g, " ").trim()}
        </p>
      </div>
      <TagList tags={job.tags} className={styles.tags} />
      <div
        className={`${styles.level} flex items-center justify-end gap-1 pt-2`}
        aria-label={`Level ${job.level}`}
      >
        {Array.from({ length: job.level }).map((_, i) => (
          <span key={i} className="h-3.5 w-[3px] rounded-[1px] bg-text-dark" />
        ))}
      </div>
    </Link>
  );
}
