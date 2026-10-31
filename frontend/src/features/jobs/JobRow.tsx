import { Link } from "react-router";
import { PinIcon, TagList, formatTimeSince } from "../../shared";
import type { Job } from "./types";
import styles from "./JobRow.module.css";

export function JobRow({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`${styles.row} group cursor-pointer py-7 text-inherit no-underline`}
    >
      <div
        className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-yellow"
        aria-hidden
      >
        {job.logo ? (
          <img src={job.logo} alt="" className="size-full object-cover" />
        ) : (
          <svg
            className="absolute -inset-0.5 size-[calc(100%+4px)] text-bg"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden
          >
            <path
              d="M1 11C1 16.5 11 16.5 11 11C11 5.5 21 5.5 21 11"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-2">
          <h3 className="m-0 text-base font-semibold leading-[1.2] text-text-dark group-hover:underline group-hover:underline-offset-[3px]">
            {job.title}
          </h3>
          <span className="font-mono text-sm font-normal leading-[1.2] text-muted">
            [{formatTimeSince(job.createdAt)}]
          </span>
          {job.pinned ? (
            <span
              className="hidden shrink-0 self-center max-[900px]:inline-flex"
              aria-label="Pinned"
            >
              <PinIcon />
            </span>
          ) : null}
        </div>
        <p className="m-0 line-clamp-2 text-[15px] font-normal leading-[1.2] text-body">
          {job.description.replace(/\n+/g, " ").trim()}
        </p>
      </div>
      <TagList tags={job.tags} className={styles.tags} />
      <div
        className={`${styles.pin} hidden items-center justify-end pt-2 min-[901px]:flex`}
        aria-label={job.pinned ? "Pinned" : undefined}
      >
        {job.pinned ? <PinIcon /> : null}
      </div>
    </Link>
  );
}
