import { queryOptions } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { Service } from "./types";

export function serviceQueryOptions(
  apiUrl: string | undefined,
  id: string | undefined,
) {
  return queryOptions({
    queryKey: ["services", id] as const,
    enabled: Boolean(apiUrl) && Boolean(id),
    queryFn: async (): Promise<Service> => {
      const res = await fetch(`${apiUrl}/services/${id}`);
      throwIfNotOk(res);
      return res.json();
    },
  });
}
