import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { LogoPlaceholder } from "../../shared";
import styles from "./MediaGallery.module.css";

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

type MediaGalleryProps = {
  images?: string[];
};

export function MediaGallery({ images = [] }: MediaGalleryProps) {
  const [zoomed, setZoomed] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const photo = images[photoIndex] ?? images[0];
  const hasMany = images.length > 1;

  useEffect(() => {
    if (!zoomed || images.length === 0) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowLeft") {
        setPhotoIndex((i) => (i - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        setPhotoIndex((i) => (i + 1) % images.length);
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed, images.length]);

  function prevPhoto(e?: MouseEvent) {
    e?.stopPropagation();
    setPhotoIndex((i) => (i - 1 + images.length) % images.length);
  }

  function nextPhoto(e?: MouseEvent) {
    e?.stopPropagation();
    setPhotoIndex((i) => (i + 1) % images.length);
  }

  return (
    <>
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
                  {photoIndex + 1} / {images.length}
                </p>
              </>
            )}
          </>
        ) : (
          <div className={`${styles.mediaFrame} ${styles.mediaFrameEmpty}`}>
            <LogoPlaceholder />
          </div>
        )}
      </div>

      {zoomed && photo && (
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
                  {photoIndex + 1} / {images.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
