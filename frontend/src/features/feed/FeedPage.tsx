import { useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { JobItem } from "../jobs/types";
import { Hero } from "./Hero";
import { LatestPostsSection } from "./LatestPostsSection";
import type { Service } from "../services";
import type { MarketItem } from "../market";

export function LandingPage() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    enabled: Boolean(apiUrl),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/jobs`);
      throwIfNotOk(res);
      return res.json() as Promise<JobItem[]>;
    },
    staleTime: Infinity,
  });

  const servicesQuery = useQuery({
    queryKey: ["services"],
    enabled: Boolean(apiUrl),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/services`);
      throwIfNotOk(res);
      return res.json() as Promise<Service[]>;
    },
  });

  const marketQuery = useQuery({
    queryKey: ["market"],
    enabled: Boolean(apiUrl),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/market`);
      throwIfNotOk(res);
      return res.json() as Promise<MarketItem[]>;
    },
  });

  return (
    <main>
      <Hero />
      <LatestPostsSection
        jobs={jobsQuery.data ?? []}
        items={marketQuery.data ?? []}
        services={servicesQuery.data ?? []}
        isPending={
          jobsQuery.isPending ||
          marketQuery.isPending ||
          servicesQuery.isPending
        }
        errors={[jobsQuery.error, marketQuery.error, servicesQuery.error]}
        apiUrl={apiUrl}
      />
    </main>
  );
}
