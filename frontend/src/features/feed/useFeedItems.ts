import { queryOptions, useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { FeedItem, ListingKind } from "../../shared";
import type { Listing } from "./listing";

export function listingsQueryOptions(apiUrl: string | undefined) {
  return queryOptions({
    queryKey: ["listings"] as const,
    enabled: Boolean(apiUrl),
    queryFn: async (): Promise<Listing[]> => {
      const res = await fetch(`${apiUrl}/listings`);
      throwIfNotOk(res);
      return res.json();
    },
  });
}

function listingHref(kind: ListingKind, id: string): string {
  switch (kind) {
    case "job":
      return `/jobs/${id}`;
    case "market":
      return `/market/${id}`;
    case "service":
      return `/services/${id}`;
  }
}

function toFeedItem(listing: Listing): FeedItem {
  if (listing.kind === "service") {
    return {
      kind: "service",
      id: listing.id,
      title: listing.company,
      description: listing.blurb,
      thumbUrl: listing.logo || undefined,
      tags: listing.tags,
      pinned: false,
      createdAt: listing.createdAt,
      href: listingHref("service", listing.id),
    };
  }

  if (listing.kind === "market") {
    return {
      kind: "market",
      id: listing.id,
      title: listing.title,
      description: listing.description,
      thumbUrl: listing.images[0] || undefined,
      tags: listing.tags,
      pinned: listing.pinned,
      createdAt: listing.createdAt,
      href: listingHref("market", listing.id),
    };
  }

  return {
    kind: "job",
    id: listing.id,
    title: listing.title,
    description: listing.description,
    thumbUrl: listing.logo,
    tags: listing.tags,
    pinned: listing.pinned,
    createdAt: listing.createdAt,
    href: listingHref("job", listing.id),
  };
}

export function useFeedItems() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const query = useQuery(listingsQueryOptions(apiUrl));

  return {
    items: query.data?.map(toFeedItem),
    isPending: Boolean(apiUrl) && query.isPending,
    isError: query.isError,
    error: query.error,
    apiUrl,
  };
}
