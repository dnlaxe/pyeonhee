import { useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { Job } from "../jobs/types";
import { Hero } from "./Hero";
import { JobsSection } from "./JobsSection";
import { MarketSection } from "./MarketSection";
import { ServicesSection } from "./ServicesSection";
import type { Service } from "../services";
import type { MarketItem } from "../market";

const JOBS_PREVIEW = 3;
const MARKET_PREVIEW = 6;
const SERVICES_PREVIEW = 6;

export function LandingPage() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    enabled: Boolean(apiUrl),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/jobs`);
      throwIfNotOk(res);
      return res.json() as Promise<Job[]>;
    },
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
      return res.json() as Promise<MarketItem[]>; // import type
    },
  });

  return (
    <main>
      <Hero />
      <JobsSection
        jobs={jobsQuery.data?.slice(0, JOBS_PREVIEW) ?? []}
        isPending={jobsQuery.isPending}
        error={jobsQuery.error}
        apiUrl={apiUrl}
      />
      <MarketSection items={marketQuery.data?.slice(0, MARKET_PREVIEW) ?? []} />
      <ServicesSection
        services={servicesQuery.data?.slice(0, SERVICES_PREVIEW) ?? []}
        isPending={servicesQuery.isPending}
        error={servicesQuery.error}
        apiUrl={apiUrl}
      />
    </main>
  );
}
