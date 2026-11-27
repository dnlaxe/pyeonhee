import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { config } from "../../config";
import { Container, ErrorMessage } from "../../shared";
import { ListingCard } from "../listings/ListingCard.tsx";
import { ListingCardSkeletonGrid } from "../listings/ListingCardSkeleton";
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
  error?: Error | null;
  onRetry?: () => void;
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
  error = null,
  onRetry,
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

  const { initialCount, batchSize } = config.feed;
  const filterKey = `${kind}:${deferredQuery}`;
  const [paging, setPaging] = useState<{
    filterKey: string;
    visibleCount: number;
    infinite: boolean;
  }>({
    filterKey,
    visibleCount: initialCount,
    infinite: false,
  });

  const visibleCount =
    paging.filterKey === filterKey ? paging.visibleCount : initialCount;
  const infinite = paging.filterKey === filterKey ? paging.infinite : false;

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount],
  );
  const hasMore = visibleCount < filteredPosts.length;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!infinite || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPaging((prev) => ({
            filterKey,
            infinite: true,
            visibleCount:
              (prev.filterKey === filterKey
                ? prev.visibleCount
                : initialCount) + batchSize,
          }));
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [infinite, hasMore, filterKey, visibleCount, initialCount, batchSize]);

  function handleShowMore() {
    setPaging({
      filterKey,
      visibleCount: visibleCount + batchSize,
      infinite: true,
    });
  }

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

          {isPending ? <ListingCardSkeletonGrid /> : null}

          {error && (
            <div className="mt-4">
              <ErrorMessage error={error} onRetry={onRetry} />
            </div>
          )}

          {!isPending &&
            !error &&
            hasActiveFilters && (
              <p className="sr-only" role="status" aria-live="polite">
                {filteredPosts.length === 1
                  ? "1 matching post"
                  : `${filteredPosts.length} matching posts`}
              </p>
            )}

          {!isPending &&
            filteredPosts.length === 0 &&
            !error && (
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

          {!isPending && filteredPosts.length > 0 && (
            <>
              <div className={cardStyles.grid}>
                {visiblePosts.map((item) => (
                  <ListingCard key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </div>
              {hasMore && !infinite && (
                <button
                  type="button"
                  className={styles.showMoreBtn}
                  onClick={handleShowMore}
                >
                  Show more
                </button>
              )}
              {hasMore && infinite && (
                <div ref={sentinelRef} aria-hidden="true" className="h-px" />
              )}
            </>
          )}
        </Container>
      </div>
    </section>
  );
}
