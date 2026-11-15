import { queryOptions } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { MarketItem } from "./types";

export function marketItemQueryOptions(
  apiUrl: string | undefined,
  id: string | undefined,
) {
  return queryOptions({
    queryKey: ["market", id] as const,
    enabled: Boolean(apiUrl) && Boolean(id),
    queryFn: async (): Promise<MarketItem> => {
      const res = await fetch(`${apiUrl}/market/${id}`);
      throwIfNotOk(res);
      return res.json();
    },
  });
}
