import { useDeferredValue, useMemo } from "react";
import { Container, ErrorMessage, LoadingState } from "../../shared";
import { ListingCard } from "../listings/ListingCard.tsx";
import cardStyles from "../listings/ListingCard.module.css";
import type { FeedKindFilter } from "../listings/types";
import type { JobItem, MarketItem, Service } from "../listings";
import { filterFeedItems, latestFirst, toFeedItems } from "./feedFilters";
import { FeedSearchBar } from "./FeedSearchBar";
import styles from "./LatestPosts.module.css";

type LatestPostsSectionProps = {
  jobs: JobItem[];
  items: MarketItem[];
  services: Service[];
  isPending?: boolean;
  errors?: Array<Error | null>;
  apiUrl?: string;
  kind: FeedKindFilter;
  query: string;
  onKindChange: (kind: FeedKindFilter) => void;
  onQueryChange: (query: string) => void;
  onResetFilters: () => void;
};

export function LatestPostsSection({
  jobs,
  items,
  services,
  isPending,
  errors = [],
  apiUrl,
  kind,
  query,
  onKindChange,
  onQueryChange,
  onResetFilters,
}: LatestPostsSectionProps) {
  const deferredQuery = useDeferredValue(query);

  const allPosts = useMemo(
    () => latestFirst(toFeedItems(jobs, items, services)),
    [jobs, items, services],
  );

  const filteredPosts = useMemo(
    () => filterFeedItems(allPosts, { kind, q: deferredQuery }),
    [allPosts, kind, deferredQuery],
  );

  const visibleErrors = Array.from(
    new Map(
      errors
        .filter((error): error is Error => Boolean(error))
        .map((error) => [error.message, error]),
    ).values(),
  );
  const hasActiveFilters = kind !== "" || query.trim() !== "";

  return (
    <section className="w-full">
      <FeedSearchBar
        kind={kind}
        query={query}
        onKindChange={onKindChange}
        onQueryChange={onQueryChange}
      />

      <div className="surface-bg w-full pt-2 pb-20 max-md:pb-14">
        <Container>
          <h2 className="heading-section m-0 mt-3 mb-2">Latest Posts</h2>

          {!apiUrl && (
            <p className="text-tone-danger">VITE_API_URL is not set</p>
          )}

          {apiUrl && isPending ? (
            <div className="flex min-h-[calc(100dvh-12rem)] w-full items-center justify-center pb-40">
              <LoadingState size={240} />
            </div>
          ) : null}

          {visibleErrors.map((error) => (
            <ErrorMessage key={error.message} error={error} />
          ))}

          {!isPending &&
            apiUrl &&
            visibleErrors.length === 0 &&
            hasActiveFilters && (
              <p className="sr-only" role="status" aria-live="polite">
                {filteredPosts.length === 1
                  ? "1 matching post"
                  : `${filteredPosts.length} matching posts`}
              </p>
            )}

          {!isPending &&
            apiUrl &&
            filteredPosts.length === 0 &&
            visibleErrors.length === 0 && (
              <div className="mt-9 text-center">
                <p className="text-meta m-0">
                  {hasActiveFilters ? "No matching posts." : "No posts yet."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={onResetFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

          {!isPending && apiUrl && filteredPosts.length > 0 && (
            <>
              <div className={cardStyles.grid}>
                {filteredPosts.map((item) => (
                  <ListingCard key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </div>
              <button type="button" className={styles.showMoreBtn}>
                Show more
              </button>
            </>
          )}
        </Container>
      </div>
    </section>
  );
}
