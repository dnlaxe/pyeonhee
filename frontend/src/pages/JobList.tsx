import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

type Job = {
	id: string;
	title: string;
	company: string;
};

export function JobList() {
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
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json() as Promise<Job[]>;
		},
	});

	return (
		<main className="mx-auto max-w-xl">
			<h1 className="text-3xl">Jobs</h1>

			{!apiUrl && <p className="text-red-700">VITE_API_URL is not set</p>}
			{isPending && <p className="text-stone-600">Loading…</p>}
			{error && <p className="text-red-700">Error: {error.message}</p>}
			{!isPending && !error && jobs.length === 0 && <p>No jobs yet.</p>}
			<ul className="flex flex-col gap-2">
				{jobs.map((job) => (
					<li
						key={job.id}
						className="flex flex-col rounded-xl border border-stone-600 p-2"
					>
						<Link
							to={`/jobs/${job.id}`}
							className="text-lg font-bold underline"
						>
							{job.title}
						</Link>
						<span className="text-stone-600">{job.company}</span>
					</li>
				))}
			</ul>
		</main>
	);
}
