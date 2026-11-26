import { useQuery } from "@tanstack/react-query";
import { Container } from "../../shared";
import { ListingCard } from "../listings/ListingCard.tsx";
import type { ListingKind } from "../listings/types";
import { listingsQueryOptions } from "../listings";
import { toFeedItems } from "./feedFilters";
import styles from "./SimilarPosts.module.css";

type Props = {
  kind: ListingKind;
  excludeId: string;
};

const LIMIT = 4;

export function SimilarPosts({ kind, excludeId }: Props) {
  const { data: similar } = useQuery({
    ...listingsQueryOptions(),
    select: (data) => {
      const jobs = kind === "job" ? data.jobs : [];
      const market = kind === "market" ? data.market : [];
      const services = kind === "service" ? data.services : [];
      return toFeedItems(jobs, market, services)
        .filter((item) => item.id !== excludeId)
        .slice(0, LIMIT);
    },
  });

  if (!similar || similar.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Similar posts">
      <Container>
        <h2 className="heading-section m-0 mb-6">Similar posts</h2>
        <div className={styles.grid}>
          {similar.map((item) => (
            <ListingCard key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
