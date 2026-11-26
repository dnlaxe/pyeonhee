import { Link, useLocation } from "react-router";
import { Skeleton, useImageStatus } from "../../shared";
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
  const { status, imgRef, onLoad, onError } = useImageStatus(thumbUrl);
  const thumbReady = status === "loaded";
  const showPlaceholder = status === "empty" || status === "error";

  return (
    <Link
      to={item.href}
      state={backTo ? { backTo } : undefined}
      className={styles.card}
    >
      <div
        className={`${styles.logo}${showPlaceholder ? ` ${styles.logoEmpty}` : ""}`}
        aria-hidden={thumbReady ? undefined : true}
      >
        {status === "loading" ? <Skeleton media extraClass="size-full" /> : null}
        {showPlaceholder ? <LogoPlaceholder /> : null}
        {thumbUrl && status !== "error" ? (
          <img
            key={thumbUrl}
            ref={imgRef}
            src={thumbUrl}
            alt=""
            className={thumbReady ? undefined : styles.thumbPending}
            onLoad={onLoad}
            onError={onError}
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
          <h3 className="text-clamp-2">
            {item.pinned ? (
              <span className={styles.pin} aria-label="Pinned">
                <PinIcon />
              </span>
            ) : null}
            {item.title}
          </h3>
        </div>
        <p className={`${styles.desc} text-clamp-2`}>
          {item.description.replace(/\n+/g, " ").trim()}
        </p>
        <TagList tags={item.tags} extraClass="mt-3" />
      </div>
    </Link>
  );
}
