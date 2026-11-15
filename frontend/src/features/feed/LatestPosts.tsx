import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Button,
  EmptyState,
  ErrorMessage,
  ListingCard,
  LoadingMessage,
  feedItemKey,
  listingKindLabel,
  type FeedItem,
  type ListingKind,
} from "../../shared";
import { config } from "../../config";
import { useFeedItems } from "./useFeedItems";
import cardStyles from "../../shared/listing/ListingCard.module.css";

type ListingKindFilter = ListingKind | "";

function isListingKind(value: string): value is ListingKind {
  return value === "job" || value === "market" || value === "service";
}

function parseListingKindFilter(
  value: string | null | undefined,
): ListingKindFilter {
  if (value == null || value === "") return "";
  return isListingKind(value) ? value : "";
}

function filterFeedItems(
  items: FeedItem[],
  kind: ListingKindFilter,
  query: string,
): FeedItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (kind && item.kind !== kind) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}

const KIND_OPTIONS: { value: ListingKindFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "job", label: listingKindLabel.job },
  { value: "market", label: listingKindLabel.market },
  { value: "service", label: listingKindLabel.service },
];

export function LatestPosts() {
  const { items, isPending, isError, error, apiUrl } = useFeedItems();
  const [params, setParams] = useSearchParams();
  const kind = parseListingKindFilter(params.get("kind"));
  const qParam = params.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(qParam);
  const [prevQParam, setPrevQParam] = useState(qParam);

  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearchInput(qParam);
  }

  const filterKey = `${kind}|${qParam}`;
  const [pagination, setPagination] = useState<{ key: string; count: number }>({
    key: filterKey,
    count: config.pageSize.feed,
  });
  const visibleCount =
    pagination.key === filterKey ? pagination.count : config.pageSize.feed;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      setParams(
        (prev) => {
          const current = (prev.get("q") ?? "").trim();
          if (next === current) return prev;
          const nextParams = new URLSearchParams(prev);
          if (next) nextParams.set("q", next);
          else nextParams.delete("q");
          return nextParams;
        },
        { replace: true },
      );
    }, 250);
    return () => window.clearTimeout(handle);
  }, [searchInput, setParams]);

  const filtered = useMemo(
    () => (items ? filterFeedItems(items, kind, qParam) : []),
    [items, kind, qParam],
  );
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function setKind(next: ListingKindFilter) {
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next) nextParams.set("kind", next);
        else nextParams.delete("kind");
        return nextParams;
      },
      { replace: true },
    );
  }

  return (
    <section id="latest" className="w-full">
      <div className="latest-posts-title">
        <div className="latest-posts-title-inner">
          <h2 className="m-0 shrink-0 text-[20px] font-normal leading-[1.2] tracking-normal text-text max-[399px]:text-[18px] max-[374px]:text-[16px]">
            Latest Posts
          </h2>
          <div className="latest-posts-tools">
            <label className="latest-posts-search">
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
            <label className="sr-only" htmlFor="latest-filter">
              Filter by type
            </label>
            <select
              id="latest-filter"
              className="latest-posts-filter select-input"
              name="kind"
              value={kind}
              onChange={(e) =>
                setKind(parseListingKindFilter(e.target.value))
              }
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

      <div className="latest-posts-cards w-full bg-bg pt-6 pb-20 max-md:pb-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          {!apiUrl ? (
            <p className="m-0 text-[20px] font-normal leading-[1.2] text-danger max-[399px]:text-[18px]">
              VITE_API_URL is not set
            </p>
          ) : null}

          {apiUrl && isPending ? <LoadingMessage /> : null}

          {apiUrl && isError && error ? <ErrorMessage error={error} /> : null}

          {apiUrl && !isPending && !isError && items && filtered.length === 0 ? (
            <EmptyState>
              {kind || qParam.trim()
                ? "No posts match this filter."
                : "No posts yet."}
            </EmptyState>
          ) : null}

          {apiUrl && !isPending && !isError && visible.length > 0 ? (
            <>
              <div className={cardStyles.grid}>
                {visible.map((item) => (
                  <ListingCard key={feedItemKey(item)} item={item} />
                ))}
              </div>
              {hasMore ? (
                <Button
                  variant="more-lg"
                  onClick={() =>
                    setPagination({
                      key: filterKey,
                      count: visibleCount + config.pageSize.feed,
                    })
                  }
                >
                  see more posts
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
