import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Prose,
  ContactForm,
  TagList,
  ErrorMessage,
  formatTimeSince,
  LogoPlaceholder,
  PinIcon,
} from "../../shared";
import type { MarketItem } from "./types";
import { throwIfNotOk } from "../../lib/httpError";
import styles from "./MarketDetail.module.css";
import { SimilarPosts } from "../feed";


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

export function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient()

  const {
    data: market,
    isPending,
    error,
  } = useQuery({
    queryKey: ["market", id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/market/${id}`);
      throwIfNotOk(res);
      return await res.json() as Promise<MarketItem>;
    },
    enabled: Boolean(apiUrl) && Boolean(id),
    initialData: () =>
      queryClient.getQueryData<MarketItem[]>(["market"])?.find((j) => j.id === id),
    staleTime: Infinity
  });

  const [zoomed, setZoomed] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setPhotoIndex(0);
    setZoomed(false);
  }

  useEffect(() => {
    if (!zoomed || !market) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowLeft") {
        setPhotoIndex((i) => (i - 1 + market.images.length) % market.images.length);
      }
      if (e.key === "ArrowRight") {
        setPhotoIndex((i) => (i + 1) % market.images.length);
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed, market]);

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

  if (!market) {
    return <Navigate to="/" replace />;
  }

  const paragraphs = market.description.split("\n").filter(Boolean);
  const photos = market.images ?? [];
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
      <article className="pt-5 pb-20 md:pt-7">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className={styles.mediaWrap}>
            {photo ? (
              <>
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
              </>
            ) : (
              <div
                className={`${styles.mediaFrame} ${styles.mediaFrameEmpty}`}
              >
                <LogoPlaceholder />
              </div>
            )}
          </div>
          <h1 className={styles.title}>
            {market.pinned ? (
              <span className="mr-[0.35em] inline-flex align-middle" aria-label="Pinned">
                <PinIcon />
              </span>
            ) : null}
            {market.title}{" "}
            <span className="align-middle text-sm font-normal text-muted">
              {formatTimeSince(market.createdAt)}
            </span>
          </h1>
          {market.price ? <p className={styles.price}>{market.price}</p> : null}
          <TagList tags={market.tags} extraClass="mb-7" />
          <Prose paragraphs={paragraphs} />
          <ContactForm
            actionLabel="Contact"
            extraClass="mt-8"
            email={market.email}
            kind="market"
            id={market.id}
          />
          <p className="mt-4 m-0">
            <Link
              to={`/report/market/${market.id}`}
              className="text-[13px] text-muted underline underline-offset-[3px]"
            >
              report this post
            </Link>
          </p>
        </div>
      </article>
      <SimilarPosts kind="market" excludeId={market.id} />

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
