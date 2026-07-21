import { useQuery } from "@tanstack/react-query";

type Job = {
  id: string;
  title: string;
  company: string;
};

function App() {
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
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json() as Promise<Job[]>;
    },
  });

  return (
    <main className="mx-auto max-w-xl text-stone-900">
      <h1 className="text-3xl">Jobs</h1>

      {!apiUrl && <p className="text-red-700">VITE_API_URL is not set</p>}
      {isPending && <p className="text-stone-600">Loading…</p>}
      {error && <p className="text-red-700">Error: {error.message}</p>}
      {!isPending && !error && jobs.length == 0 && <p>No jobs yet.</p>}

      <ul className="flex flex-col gap-2">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-col p-2 b border border-stone-600 rounded-xl"
          >
            <strong className="text-lg">{job.title}</strong>
            <span className="text-stone-600">{job.company}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
