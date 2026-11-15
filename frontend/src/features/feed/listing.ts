import type { Job } from "../jobs/types";
import type { MarketItem } from "../market/types";
import type { Service } from "../services/types";
import type { ListingKind } from "../../shared";

export type Listing =
  | ({ kind: "job" } & Job)
  | ({ kind: "market" } & MarketItem)
  | ({ kind: "service" } & Service);

export function findListing<K extends ListingKind>(
  listings: Listing[] | undefined,
  kind: K,
  id: string | undefined,
): Extract<Listing, { kind: K }> | undefined {
  if (!id || !listings) return undefined;
  return listings.find(
    (row): row is Extract<Listing, { kind: K }> =>
      row.kind === kind && row.id === id,
  );
}
