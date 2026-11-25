import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import {
  jobsQueryOptions,
  marketQueryOptions,
  servicesQueryOptions,
} from "../listings";
import type { FeedKindFilter } from "../listings/types";
import { buildFeedSearchParams, parseKindParam } from "./feedFilters";
import { Hero } from "./Hero";
import { LatestPostsSection } from "./LatestPostsSection";

const EMPTY: never[] = [];

export function FeedPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [searchParams, setSearchParams] = useSearchParams();

  const kind = parseKindParam(searchParams.get("kind"));
  const query = searchParams.get("q") ?? "";

  const needJobs = kind === "" || kind === "job";
  const needMarket = kind === "" || kind === "market";
  const needServices = kind === "" || kind === "service";

  const jobsQuery = useQuery({
    ...jobsQueryOptions(),
    enabled: Boolean(apiUrl) && needJobs,
  });
  const servicesQuery = useQuery({
    ...servicesQueryOptions(),
    enabled: Boolean(apiUrl) && needServices,
  });
  const marketQuery = useQuery({
    ...marketQueryOptions(),
    enabled: Boolean(apiUrl) && needMarket,
  });

  function handleKindChange(nextKind: FeedKindFilter) {
    setSearchParams((prev) => buildFeedSearchParams(prev, { kind: nextKind }));
  }

  function handleQueryChange(nextQuery: string) {
    setSearchParams(
      (prev) => buildFeedSearchParams(prev, { q: nextQuery }),
      { replace: true },
    );
  }

  function handleResetFilters() {
    setSearchParams((prev) => buildFeedSearchParams(prev, { kind: "", q: "" }));
  }

  const isPending =
    (needJobs && jobsQuery.isPending) ||
    (needMarket && marketQuery.isPending) ||
    (needServices && servicesQuery.isPending);

  const errors = [
    needJobs ? jobsQuery.error : null,
    needMarket ? marketQuery.error : null,
    needServices ? servicesQuery.error : null,
  ];

  return (
    <main>
      <Hero />
      <LatestPostsSection
        jobs={needJobs ? (jobsQuery.data ?? EMPTY) : EMPTY}
        items={needMarket ? (marketQuery.data ?? EMPTY) : EMPTY}
        services={needServices ? (servicesQuery.data ?? EMPTY) : EMPTY}
        isPending={isPending}
        errors={errors}
        apiUrl={apiUrl}
        kind={kind}
        query={query}
        onKindChange={handleKindChange}
        onQueryChange={handleQueryChange}
        onResetFilters={handleResetFilters}
      />
    </main>
  );
}
