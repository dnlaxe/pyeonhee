import { useQueries } from "@tanstack/react-query";
import { ListingCard } from "../listings/ListingCard.tsx";
import type { FeedItem, ListingKind } from "../listings/types";
import {
  jobsQueryOptions,
  marketQueryOptions,
  servicesQueryOptions,
} from "../listings";
import styles from "./SimilarPosts.module.css";

type Props = {
  kind: ListingKind;
  excludeId: string;
};

const LIMIT = 4;

export function SimilarPosts({ kind, excludeId }: Props) {
  const [jobsQ, marketQ, servicesQ] = useQueries({
    queries: [
      jobsQueryOptions(),
      marketQueryOptions(),
      servicesQueryOptions(),
    ],
  });

  const jobs = jobsQ.data ?? [];
  const market = marketQ.data ?? [];
  const services = servicesQ.data ?? [];

  if (!jobsQ.data && !marketQ.data && !servicesQ.data) return null;

  const items: FeedItem[] = [
    ...jobs.map(
      (job): FeedItem => ({
        kind: "job",
        id: job.id,
        title: job.title,
        description: job.description,
        thumbUrl: job.logo,
        tags: job.tags,
        pinned: job.pinned,
        createdAt: job.createdAt,
        href: `/jobs/${job.id}`,
      }),
    ),
    ...market.map(
      (item): FeedItem => ({
        kind: "market",
        id: item.id,
        title: item.title,
        description: item.description,
        thumbUrl: item.images[0],
        tags: item.tags,
        pinned: item.pinned,
        createdAt: item.createdAt,
        href: `/market/${item.id}`,
      }),
    ),
    ...services.map(
      (service): FeedItem => ({
        kind: "service",
        id: service.id,
        title: service.company,
        description: service.blurb,
        thumbUrl: service.logo || undefined,
        tags: service.tags,
        pinned: false,
        createdAt: service.createdAt,
        href: `/services/${service.id}`,
      }),
    ),
  ];

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
