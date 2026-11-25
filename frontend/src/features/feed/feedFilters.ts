import {
  listingKindLabel,
  type FeedItem,
  type FeedKindFilter,
  type JobItem,
  type MarketItem,
  type Service,
} from "../listings/types";

export function parseKindParam(value: string | null): FeedKindFilter {
  if (value === "job" || value === "market" || value === "service") {
    return value;
  }
  return "";
}

export function buildFeedSearchParams(
  current: URLSearchParams,
  patch: { kind?: FeedKindFilter; q?: string },
): URLSearchParams {
  const next = new URLSearchParams(current);

  if (patch.kind !== undefined) {
    if (patch.kind) {
      next.set("kind", patch.kind);
    } else {
      next.delete("kind");
    }
  }

  if (patch.q !== undefined) {
    if (patch.q.length > 0) {
      next.set("q", patch.q);
    } else {
      next.delete("q");
    }
  }

  return next;
}

export function toFeedItems(
  jobs: JobItem[],
  items: MarketItem[],
  services: Service[],
): FeedItem[] {
  return [
    ...jobs.map(
      (job): FeedItem => ({
        kind: "job",
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location ?? "",
        thumbUrl: job.logo,
        tags: job.tags,
        pinned: job.pinned,
        createdAt: job.createdAt,
        href: `/jobs/${job.id}`,
      }),
    ),
    ...items.map(
      (item): FeedItem => ({
        kind: "market",
        id: item.id,
        title: item.title,
        description: item.description,
        location: item.location ?? "",
        thumbUrl: item.images[0],
        tags: item.tags,
        pinned: item.pinned,
        createdAt: item.createdAt,
        href: `/market/${item.id}`,
      }),
    ),
    ...services.map(
      (service): FeedItem => ({
        kind: "service",
        id: service.id,
        title: service.company,
        description: service.blurb,
        location: service.location ?? "",
        thumbUrl: service.logo || undefined,
        tags: service.tags,
        pinned: false,
        createdAt: service.createdAt,
        href: `/services/${service.id}`,
      }),
    ),
  ];
}

export function latestFirst(posts: readonly FeedItem[]): FeedItem[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function matchesSearch(item: FeedItem, query: string): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = [
    item.title,
    item.description,
    item.location,
    listingKindLabel[item.kind],
    ...item.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

export function filterFeedItems(
  items: readonly FeedItem[],
  filters: { kind: FeedKindFilter; q: string },
): FeedItem[] {
  return items.filter(
    (item) =>
      (filters.kind === "" || item.kind === filters.kind) &&
      matchesSearch(item, filters.q),
  );
}
