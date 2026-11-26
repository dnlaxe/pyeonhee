import { useCallback, useState } from "react";
import { LogoPlaceholder } from "../icons/LogoPlaceholder";
import styles from "./ListingLogo.module.css";

type Props = {
  src?: string;
  extraClass?: string;
};

export function ListingLogo({ src, extraClass }: Props) {
  const logoUrl = src?.trim() || "";
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const logoReady = Boolean(logoUrl) && loadedUrl === logoUrl;

  const logoRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoadedUrl(logoUrl);
      }
    },
    [logoUrl],
  );

  return (
    <div
      className={`${styles.detailLogo} shrink-0${extraClass ? ` ${extraClass}` : ""}`}
    >
      {!logoReady ? <LogoPlaceholder /> : null}
      {logoUrl ? (
        <img
          key={logoUrl}
          ref={logoRef}
          src={logoUrl}
          alt=""
          hidden={!logoReady}
          onLoad={() => setLoadedUrl(logoUrl)}
          onError={() => setLoadedUrl(null)}
        />
      ) : null}
    </div>
  );
}
