import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BackLink,
  Prose,
  RelayEmail,
  ReportLink,
  TagList,
  ErrorMessage,
} from "../../shared";
import type { MarketItem } from "./types";
import { getMarketItemById } from "./marketData";
import styles from "./MarketItemPage.module.css";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className={styles.chevron}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
    >
      {dir === "left" ? (
        <path
          d="M9 2L4 7l5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M5 2l5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function MarketItemPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const fromList = queryClient
    .getQueryData<MarketItem[]>(["market"])
    ?.find((item) => item.id === id);

  const {
    data: item,
    isPending,
    error,
  } = useQuery({
    queryKey: ["market", id],
    enabled: Boolean(id) && !fromList,
    initialData: fromList,
    queryFn: () => getMarketItemById(id!),
  });

  const [zoomed, setZoomed] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
    setZoomed(false);
  }, [id]);

  useEffect(() => {
    if (!zoomed || !item) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowLeft") {
        setPhotoIndex((i) => (i - 1 + item.images.length) % item.images.length);
      }
      if (e.key === "ArrowRight") {
        setPhotoIndex((i) => (i + 1) % item.images.length);
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed, item]);

  if (isPending) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <ErrorMessage error={error} />
      </main>
    );
  }

  if (!item) {
    return <Navigate to="/market" replace />;
  }

  const paragraphs = item.description.split("\n").filter(Boolean);
  const photos = item.images;
  const photo = photos[photoIndex] ?? photos[0];
  const hasMany = photos.length > 1;

  function prevPhoto(e?: MouseEvent) {
    e?.stopPropagation();
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function nextPhoto(e?: MouseEvent) {
    e?.stopPropagation();
    setPhotoIndex((i) => (i + 1) % photos.length);
  }

  return (
    <main>
      <article className={styles.article}>
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <BackLink to="/market">← back to market</BackLink>
          <div className={styles.mediaWrap}>
            <button
              type="button"
              className={styles.mediaFrame}
              onClick={() => setZoomed(true)}
              aria-label="View larger image"
            >
              <img src={photo} alt="" className={styles.image} />
            </button>
            {hasMany && (
              <>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.navPrev}`}
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.navNext}`}
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  <Chevron dir="right" />
                </button>
                <p className={styles.counter}>
                  {photoIndex + 1} / {photos.length}
                </p>
              </>
            )}
          </div>
          <h1 className={styles.title}>{item.title}</h1>
          <TagList tags={item.tags} className="mb-7" />
          <Prose paragraphs={paragraphs} />
          <RelayEmail
            listingId={item.id}
            actionLabel="Contact"
            className="mt-8"
          />
          <ReportLink to={`/market/${item.id}/report`} />
        </div>
      </article>

      {zoomed && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image"
          onClick={() => setZoomed(false)}
        >
          <div
            className={styles.lightboxStage}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={photo} alt="" className={styles.lightboxImage} />
            {hasMany && (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  <Chevron dir="right" />
                </button>
                <p className={styles.lightboxCounter}>
                  {photoIndex + 1} / {photos.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
