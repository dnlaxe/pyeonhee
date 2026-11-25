import type { MarketTag, ServiceTag } from "./constants";

export type JobItem = {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  logo?: string;
  email?: string;
  pinned: boolean;
  status: string;
  createdAt: string;
};

export type MarketItem = {
  id: string;
  title: string;
  location: string;
  description: string;
  images: string[];
  tags: MarketTag[];
  price: string;
  email?: string;
  pinned: boolean;
  createdAt: string;
};

export type ServiceItem = {
  id: string;
  company: string;
  location: string;
  logo: string;
  blurb: string;
  contact: string;
  webpage?: string;
  tags: ServiceTag[];
  createdAt: string;
};

export type Service = ServiceItem;

export type ListingKind = "job" | "market" | "service";
export type FeedKindFilter = ListingKind | "";

export type FeedItem = {
  kind: ListingKind;
  id: string;
  title: string;
  description: string;
  location: string;
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
