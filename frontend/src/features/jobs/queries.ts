import { queryOptions } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import type { Job } from "./types";

export function jobQueryOptions(
  apiUrl: string | undefined,
  id: string | undefined,
) {
  return queryOptions({
    queryKey: ["jobs", id] as const,
    enabled: Boolean(apiUrl) && Boolean(id),
    queryFn: async (): Promise<Job> => {
      const res = await fetch(`${apiUrl}/jobs/${id}`);
      throwIfNotOk(res);
      return res.json();
    },
  });
}
