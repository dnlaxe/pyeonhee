import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { PinIcon } from "../icons/PinIcon";
import { formatTimeSince } from "../lib/text";
import type { FeedItem } from "./types";
import { listingKindLabel } from "./types";
import styles from "./ListingCard.module.css";

function ThumbPlaceholder() {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M1 11C1 16.5 11 16.5 11 11C11 5.5 21 5.5 21 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ListingCard({ item }: { item: FeedItem }) {
  const [thumbReady, setThumbReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setThumbReady(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setThumbReady(true);
    }
  }, [item.thumbUrl, item.kind, item.id]);

  const hasThumb = Boolean(item.thumbUrl);

  return (
    <Link to={item.href} className={`${styles.card} group`}>
      <div className={styles.logo} aria-hidden={thumbReady ? undefined : true}>
        {!thumbReady ? <ThumbPlaceholder /> : null}
        {hasThumb ? (
          <img
            ref={imgRef}
            src={item.thumbUrl}
            alt=""
            className={thumbReady ? undefined : styles.thumbPending}
            onLoad={() => setThumbReady(true)}
            onError={() => setThumbReady(false)}
          />
        ) : null}
      </div>
      <div className={styles.kindRow}>
        <p className={styles.kind}>{listingKindLabel[item.kind]}</p>
        <div className={styles.meta}>
          <span>{formatTimeSince(item.createdAt)}</span>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className="line-clamp-2">
            {item.pinned ? (
              <span className={styles.pin} aria-label="Pinned">
                <PinIcon />
              </span>
            ) : null}
            {item.title}
          </h3>
        </div>
        <p className={`${styles.desc} line-clamp-2`}>
          {item.description.replace(/\n+/g, " ").trim()}
        </p>
        {item.tags.length > 0 ? (
          <div className={styles.tags}>
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
