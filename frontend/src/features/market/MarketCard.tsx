import { Link } from "react-router";
import { formatTimeSince, PinIcon, TagList } from "../../shared";
import type { MarketItem } from "./types";
import styles from "./MarketCard.module.css";

export function MarketCard({ item }: { item: MarketItem }) {
  const thumb = item.images[0];

  return (
    <Link to={`/market/${item.id}`} className={styles.card}>
      <div className={styles.media}>
        {thumb ? <img src={thumb} alt="" className={styles.image} /> : null}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          {item.title}{" "}
          <span className="font-mono text-sm font-normal text-muted">
            [{formatTimeSince(item.createdAt)}]
          </span>
          {item.pinned ? (
            <span
              className="ml-1.5 inline-flex align-middle"
              aria-label="Pinned"
            >
              <PinIcon />
            </span>
          ) : null}
        </h3>
        <p className="m-0 line-clamp-2 text-[15px] font-normal leading-normal text-body">
          {item.description.replace(/\n+/g, " ").trim()}
        </p>
        <TagList tags={item.tags} className="mt-2.5" />
      </div>
    </Link>
  );
}
