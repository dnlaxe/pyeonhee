import { Button, ErrorMessage } from "../../shared";
import { JobRow } from "../jobs/JobRow";
import type { Job } from "../jobs/types";

type JobsSectionProps = {
  jobs: Job[];
  isPending?: boolean;
  error?: Error | null;
  apiUrl?: string;
};

export function JobsSection({
  jobs,
  isPending,
  error,
  apiUrl,
}: JobsSectionProps) {
  return (
    <section className="scroll-mt-20 py-20 pb-7">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <h2 className="mb-3 text-2xl font-semibold leading-[1.2] text-text-dark">
          Job Board
        </h2>

        {!apiUrl && <p className="text-red-700">VITE_API_URL is not set</p>}
        {isPending && <p className="text-muted">Loading…</p>}
        {error && <ErrorMessage error={error} />}

        {!isPending && !error && apiUrl && (
          <>
            <div className="grid grid-cols-[72px_minmax(0,1.2fr)_minmax(0,1fr)_48px] gap-x-7 gap-y-5 border-b border-border py-3 font-mono text-xs leading-[1.2] text-muted max-[900px]:mt-5 max-[900px]:border-b max-[900px]:border-border max-[900px]:p-0 max-[900px]:[&_span]:hidden [&_span:last-child]:text-right mt-5">
              <span>no.</span>
              <span>description</span>
              <span>topics</span>
              <span>level</span>
            </div>
            <div className="relative overflow-hidden">
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[35%] bg-gradient-to-t from-bg to-transparent"
                aria-hidden
              />
            </div>
          </>
        )}

        <Button variant="more" to="/jobs">
          see more jobs
        </Button>
      </div>
    </section>
  );
}
