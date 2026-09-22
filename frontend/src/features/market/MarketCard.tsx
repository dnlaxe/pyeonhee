import { Link } from "react-router";
import { TagList } from "../../shared";
import type { MarketItem } from "./types";
import styles from "./MarketCard.module.css";

export function MarketCard({ item }: { item: MarketItem }) {
  const thumb = item.images[0];

  return (
    <Link to={`/market/${item.id}`} className={styles.card}>
      <div className={styles.media}>
        <div
          className={`${styles.mediaFrame} ${!thumb ? styles.mediaFrameEmpty : ""}`}
        >
          {thumb ? <img src={thumb} alt="" className={styles.image} /> : null}
        </div>
      </div>
      <h3 className={styles.title}>{item.title}</h3>
      <p className="m-0 line-clamp-2 text-[15px] font-normal leading-normal text-body">
        {item.description.replace(/\n+/g, " ").trim()}
      </p>
      <TagList tags={item.tags} className="mt-2.5" />
    </Link>
  );
}
