import { useQueries } from "@tanstack/react-query";
import { ListingCard } from "../listings/ListingCard.tsx";
import type { ListingKind } from "../listings/types";
import {
  jobsQueryOptions,
  marketQueryOptions,
  servicesQueryOptions,
} from "../listings";
import { toFeedItems } from "./feedFilters";
import styles from "./SimilarPosts.module.css";

type Props = {
  kind: ListingKind;
  excludeId: string;
};

const LIMIT = 4;

export function SimilarPosts({ kind, excludeId }: Props) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [jobsQ, marketQ, servicesQ] = useQueries({
    queries: [
      { ...jobsQueryOptions(), enabled: Boolean(apiUrl) && kind === "job" },
      { ...marketQueryOptions(), enabled: Boolean(apiUrl) && kind === "market" },
      {
        ...servicesQueryOptions(),
        enabled: Boolean(apiUrl) && kind === "service",
      },
    ],
  });

  const jobs = kind === "job" ? (jobsQ.data ?? []) : [];
  const market = kind === "market" ? (marketQ.data ?? []) : [];
  const services = kind === "service" ? (servicesQ.data ?? []) : [];

  if (!jobsQ.data && !marketQ.data && !servicesQ.data) return null;

  const items = toFeedItems(jobs, market, services);

  const similar = items
    .filter((item) => item.kind === kind && item.id !== excludeId)
    .slice(0, LIMIT);

  if (similar.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Similar posts">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Similar posts</h2>
        <div className={styles.grid}>
          {similar.map((item) => (
            <ListingCard key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
