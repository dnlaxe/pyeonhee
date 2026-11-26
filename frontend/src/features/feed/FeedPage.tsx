import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { listingsQueryOptions } from "../listings";
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

  const listingsQuery = useQuery(listingsQueryOptions());

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

  return (
    <main>
      <Hero />
      <LatestPostsSection
        jobs={listingsQuery.data?.jobs ?? EMPTY}
        items={listingsQuery.data?.market ?? EMPTY}
        services={listingsQuery.data?.services ?? EMPTY}
        isPending={listingsQuery.isPending}
        error={listingsQuery.error}
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
