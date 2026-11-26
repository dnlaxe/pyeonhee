import { LogoPlaceholder } from "../icons/LogoPlaceholder";
import { useImageStatus } from "../helpers/useImageStatus";
import { Skeleton } from "./Skeleton";
import styles from "./ListingLogo.module.css";

type Props = {
  src?: string;
  extraClass?: string;
};

export function ListingLogo({ src, extraClass }: Props) {
  const logoUrl = src?.trim() || "";
  const { status, imgRef, onLoad, onError } = useImageStatus(logoUrl);
  const logoReady = status === "loaded";
  const showPlaceholder = status === "empty" || status === "error";

  return (
    <div
      className={`${styles.detailLogo}${showPlaceholder ? ` ${styles.detailLogoEmpty}` : ""} shrink-0${extraClass ? ` ${extraClass}` : ""}`}
    >
      {status === "loading" ? <Skeleton media extraClass="size-full" /> : null}
      {showPlaceholder ? <LogoPlaceholder /> : null}
      {logoUrl && status !== "error" ? (
        <img
          key={logoUrl}
          ref={imgRef}
          src={logoUrl}
          alt=""
          className={logoReady ? undefined : styles.logoPending}
          onLoad={onLoad}
          onError={onError}
        />
      ) : null}
    </div>
  );
}
