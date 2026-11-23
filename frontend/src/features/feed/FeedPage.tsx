import { useQuery } from "@tanstack/react-query";
import {
  jobsQueryOptions,
  marketQueryOptions,
  servicesQueryOptions,
} from "../listings";
import { Hero } from "./Hero";
import { LatestPostsSection } from "./LatestPostsSection";

export function FeedPage() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const jobsQuery = useQuery(jobsQueryOptions());
  const servicesQuery = useQuery(servicesQueryOptions());
  const marketQuery = useQuery(marketQueryOptions());

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
