import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { JobItem, ListingsResponse, MarketItem, Service } from "./types";

export const LIST_STALE_TIME = 5 * 60 * 1000;

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`/api${path}`, { signal });
  throwIfNotOk(res);
  return (await res.json()) as T;
}

export const listingsQueryOptions = () =>
  queryOptions({
    queryKey: ["listings"] as const,
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<ListingsResponse>("/listings", signal),
  });

export const jobDetailQueryOptions = (
  queryClient: QueryClient,
  id: string | undefined,
) =>
  queryOptions({
    queryKey: ["jobs", id] as const,
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<JobItem>(`/jobs/${id}`, signal),
    initialData: () =>
      queryClient
        .getQueryData(listingsQueryOptions().queryKey)
        ?.jobs.find((j) => j.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(listingsQueryOptions().queryKey)?.dataUpdatedAt,
  });

export const marketDetailQueryOptions = (
  queryClient: QueryClient,
  id: string | undefined,
) =>
  queryOptions({
    queryKey: ["market", id] as const,
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<MarketItem>(`/market/${id}`, signal),
    initialData: () =>
      queryClient
        .getQueryData(listingsQueryOptions().queryKey)
        ?.market.find((m) => m.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(listingsQueryOptions().queryKey)?.dataUpdatedAt,
  });

export const serviceDetailQueryOptions = (
  queryClient: QueryClient,
  id: string | undefined,
) =>
  queryOptions({
    queryKey: ["services", id] as const,
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<Service>(`/services/${id}`, signal),
    initialData: () =>
      queryClient
        .getQueryData(listingsQueryOptions().queryKey)
        ?.services.find((s) => s.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(listingsQueryOptions().queryKey)?.dataUpdatedAt,
  });