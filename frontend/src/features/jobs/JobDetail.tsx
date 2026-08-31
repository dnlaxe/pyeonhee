import { Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BackLink,
  Prose,
  RelayEmail,
  ReportLink,
  TagList,
  formatTimeSince,
  ErrorMessage,
} from "../../shared";
import { throwIfNotOk } from "../../lib/httpError";
import type { Job } from "./data";

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();
  const fromList = queryClient
    .getQueryData<Job[]>(["jobs"])
    ?.find((j) => j.id === id);

  const {
    data: job,
    isPending,
    error,
  } = useQuery({
    queryKey: ["jobs", id],
    enabled: Boolean(apiUrl) && Boolean(id) && !fromList,
    initialData: fromList,
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/jobs/${id}`);
      throwIfNotOk(res);
      return res.json() as Promise<Job>;
    },
  });

  if (!apiUrl) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="text-red-700">VITE_API_URL is not set</p>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <ErrorMessage error={error} />
      </main>
    );
  }

  if (!job) {
    return <Navigate to="/jobs" replace />;
  }

  const paragraphs = job.description.split("\n").filter(Boolean);

  return (
    <main>
      <article className="py-2 pb-20">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <BackLink to="/jobs">← back to jobs</BackLink>
          <div className="mb-5 flex items-start gap-5">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-full bg-yellow font-mono text-base font-medium leading-normal text-text-dark"
              aria-hidden
            >
              {job.initials}
            </div>
            <div className="min-w-0">
              <h1 className="mb-2 text-[clamp(24px,4vw,32px)] font-bold leading-[1.2] tracking-[-0.5px] text-text">
                {job.title}
              </h1>
              <span className="font-mono text-sm leading-[1.2] text-muted">
                [{formatTimeSince(job.createdAt)}]
              </span>
            </div>
          </div>
          <TagList tags={job.tags} className="mb-7" />
          <Prose paragraphs={paragraphs} />
          <RelayEmail listingId={job.id} actionLabel="Apply" className="mt-8" />
          <ReportLink to={`/jobs/${job.id}/report`} />
        </div>
      </article>
    </main>
  );
}
