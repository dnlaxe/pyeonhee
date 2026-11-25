import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router";
import { TagList } from "../../shared/ui/TagList.tsx";
import { LogoPlaceholder } from "../../shared/icons/LogoPlaceholder.tsx";
import { PinIcon } from "../../shared/icons/PinIcon.tsx";
import { formatTimeSince } from "../../shared/helpers/time.ts";
import styles from "./ListingCard.module.css";
import { type FeedItem, listingKindLabel } from "./types.ts";

function readBackTo(state: unknown): string | undefined {
  if (
    typeof state === "object" &&
    state !== null &&
    "backTo" in state &&
    typeof state.backTo === "string"
  ) {
    return state.backTo;
  }
  return undefined;
}

export function ListingCard({ item }: { item: FeedItem }) {
  const { pathname, search, state } = useLocation();
  const backTo = pathname === "/" ? `/${search}` : readBackTo(state);

  const thumbUrl = item.thumbUrl ?? "";
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const thumbReady = Boolean(thumbUrl) && loadedUrl === thumbUrl;

  const imgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoadedUrl(thumbUrl);
      }
    },
    [thumbUrl],
  );

  return (
    <Link
      to={item.href}
      state={backTo ? { backTo } : undefined}
      className={`${styles.card} group`}
    >
      <div className={styles.logo} aria-hidden={thumbReady ? undefined : true}>
        {!thumbReady ? <LogoPlaceholder /> : null}
        {thumbUrl ? (
          <img
            key={thumbUrl}
            ref={imgRef}
            src={thumbUrl}
            alt=""
            className={thumbReady ? undefined : styles.thumbPending}
            onLoad={() => setLoadedUrl(thumbUrl)}
            onError={() => setLoadedUrl(null)}
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
        <TagList tags={item.tags} extraClass="mt-3" />
      </div>
    </Link>
  );
}
