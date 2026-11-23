import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { JobItem, MarketItem, Service } from "./types";

const apiUrl = import.meta.env.VITE_API_URL;
export const LIST_STALE_TIME = 5 * 60 * 1000;

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, { signal });
  throwIfNotOk(res);
  return (await res.json()) as T;
}

export const jobsQueryOptions = () =>
  queryOptions({
    queryKey: ["jobs"] as const,
    enabled: Boolean(apiUrl),
    staleTime: LIST_STALE_TIME,
    queryFn: async ({ signal }) => {
      // Temporary delay to inspect LoadingState
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return fetchJson<JobItem[]>("/jobs", signal);
    },
  });

export const marketQueryOptions = () =>
  queryOptions({
    queryKey: ["market"] as const,
    enabled: Boolean(apiUrl),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<MarketItem[]>("/market", signal),
  });

export const servicesQueryOptions = () =>
  queryOptions({
    queryKey: ["services"] as const,
    enabled: Boolean(apiUrl),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<Service[]>("/services", signal),
  });

export const jobDetailQueryOptions = (
  queryClient: QueryClient,
  id: string | undefined,
) =>
  queryOptions({
    queryKey: ["jobs", id] as const,
    enabled: Boolean(apiUrl) && Boolean(id),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<JobItem>(`/jobs/${id}`, signal),
    initialData: () =>
      queryClient
        .getQueryData(jobsQueryOptions().queryKey)
        ?.find((j) => j.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(jobsQueryOptions().queryKey)?.dataUpdatedAt,
  });

export const marketDetailQueryOptions = (
  queryClient: QueryClient,
  id: string | undefined,
) =>
  queryOptions({
    queryKey: ["market", id] as const,
    enabled: Boolean(apiUrl) && Boolean(id),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<MarketItem>(`/market/${id}`, signal),
    initialData: () =>
      queryClient
        .getQueryData(marketQueryOptions().queryKey)
        ?.find((m) => m.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(marketQueryOptions().queryKey)?.dataUpdatedAt,
  });

export const serviceDetailQueryOptions = (
  queryClient: QueryClient,
  id: string | undefined,
) =>
  queryOptions({
    queryKey: ["services", id] as const,
    enabled: Boolean(apiUrl) && Boolean(id),
    staleTime: LIST_STALE_TIME,
    queryFn: ({ signal }) => fetchJson<Service>(`/services/${id}`, signal),
    initialData: () =>
      queryClient
        .getQueryData(servicesQueryOptions().queryKey)
        ?.find((s) => s.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(servicesQueryOptions().queryKey)?.dataUpdatedAt,
  });