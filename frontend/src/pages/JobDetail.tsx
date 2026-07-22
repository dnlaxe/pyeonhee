import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

type Job = {
  id: string;
  title: string;
  company: string;
};

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

  const {
    data: job,
    isPending,
    error,
  } = useQuery({
    queryKey: ["jobs", id],
    enabled: Boolean(apiUrl) && Boolean(id),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/jobs/${id}`);
      if (res.status === 404) throw new Error("Job not found");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Job>;
    },
  });

  return (
    <main className="mx-auto max-w-xl">
      <p className="mb-4">
        <Link to="/" className="underline">
          All jobs
        </Link>
      </p>
      {isPending && <p className="text-stone-600">Loading…</p>}
      {error && <p className="text-red-700">Error: {error.message}</p>}
      {job && (
        <>
          <h1 className="text-3xl">{job.title}</h1>
          <p className="mt-2 text-stone-600">{job.company}</p>
          <p className="mt-4 text-sm text-stone-500">id: {job.id}</p>
        </>
      )}
    </main>
  );
}
