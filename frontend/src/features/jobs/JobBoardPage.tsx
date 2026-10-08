import { useQuery } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  FilterBar,
  useTagFilter,
  ErrorMessage,
} from "../../shared";
import { throwIfNotOk } from "../../lib/httpError";
import { type Job } from "./types";
import { JobRow } from "./JobRow";
import { jobFilters } from "./constants";
import { config } from "../../config";

export function JobBoardPage() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const {
    data: jobs = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["jobs"],
    enabled: Boolean(apiUrl),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/jobs`);
      throwIfNotOk(res);
      return res.json() as Promise<Job[]>;
    },
  });

  const { visible, hasMore, isEmpty, filter, setFilterTag, loadMore } =
    useTagFilter(
      jobs,
      (job, tag) => job.tags.includes(tag as (typeof jobFilters)[number]),
      config.pageSize.jobs,
    );

  return (
    <main>
      <section className="scroll-mt-20 py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          <h2 className="mb-3 text-2xl font-semibold leading-[1.2] text-text-dark">
            Job Board
          </h2>

          {!apiUrl && <p className="text-red-700">VITE_API_URL is not set</p>}
          {isPending && <p className="text-muted">Loading…</p>}
          {error && <ErrorMessage error={error} />}

          {!isPending && !error && apiUrl && (
            <>
              <FilterBar
                filters={jobFilters}
                active={filter}
                onChange={setFilterTag}
              />
              {isEmpty ? (
                <EmptyState>No jobs match this tag.</EmptyState>
              ) : (
                <>
                  <div>
                    {visible.map((job) => (
                      <JobRow key={job.id} job={job} />
                    ))}
                  </div>
                  {hasMore && (
                    <Button variant="more" onClick={loadMore}>
                      see more jobs
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
