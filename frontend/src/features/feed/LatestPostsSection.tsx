import { useDeferredValue, useMemo } from "react";
import { ErrorMessage, LoadingState } from "../../shared";
import { ListingCard } from "../listings/ListingCard.tsx";
import cardStyles from "../listings/ListingCard.module.css";
import { listingKindLabel, type FeedKindFilter } from "../listings/types";
import type { JobItem, MarketItem, Service } from "../listings";
import {
  filterFeedItems,
  latestFirst,
  parseKindParam,
  toFeedItems,
} from "./feedFilters";
import styles from "./LatestPosts.module.css";

const KIND_OPTIONS = [
  { value: "", label: "All" },
  { value: "job", label: listingKindLabel.job },
  { value: "market", label: listingKindLabel.market },
  { value: "service", label: listingKindLabel.service },
] as const;

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
      <div className={styles.titleBar}>
        <div className={styles.titleBarInner}>
          <h2 className="m-0 shrink-0 text-[20px] font-normal leading-[1.2] tracking-normal text-text max-[399px]:text-[18px] max-[374px]:text-[16px]">
            Latest Posts
          </h2>
          <div className={styles.tools}>
            <label className={styles.search}>
              <span className="sr-only">Search posts</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Search"
                autoComplete="off"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </label>
            <label className="sr-only" htmlFor="latest-filter">
              Filter by type
            </label>
            <select
              id="latest-filter"
              className={`select-input ${styles.filter}`}
              name="kind"
              value={kind}
              onChange={(e) => onKindChange(parseKindParam(e.target.value))}
            >
              {KIND_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="w-full bg-bg pt-6 pb-20 max-md:pb-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          {!apiUrl && <p className="text-danger">VITE_API_URL is not set</p>}

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
                <p className="m-0 text-[15px] leading-normal text-muted">
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
            <div className={cardStyles.grid}>
              {filteredPosts.map((item) => (
                <ListingCard key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
