export type ListingKind = "job" | "market" | "service";

/** Card view model for a listing in grids / similar posts. */
export type FeedItem = {
  kind: ListingKind;
  id: string;
  title: string;
  description: string;
  thumbUrl?: string;
  tags: readonly string[];
  pinned: boolean;
  createdAt: string;
  href: string;
};

export const listingKindLabel: Record<ListingKind, string> = {
  job: "Work",
  market: "For Sale",
  service: "Service",
};

/** Stable React list key — ids are not unique across kinds */
export function feedItemKey(item: Pick<FeedItem, "kind" | "id">): string {
  return `${item.kind}:${item.id}`;
}
