import { useCallback, useState } from "react";

export type ImageStatus = "empty" | "loading" | "loaded" | "error";

export function useImageStatus(url: string) {
  const [result, setResult] = useState<{
    url: string;
    status: "loaded" | "error";
  } | null>(null);

  const imgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) {
        setResult({
          url,
          status: img.naturalWidth > 0 ? "loaded" : "error",
        });
      }
    },
    [url],
  );

  const onLoad = useCallback(() => {
    setResult({ url, status: "loaded" });
  }, [url]);

  const onError = useCallback(() => {
    setResult({ url, status: "error" });
  }, [url]);

  const status: ImageStatus = !url
    ? "empty"
    : result?.url === url
      ? result.status
      : "loading";

  return { status, imgRef, onLoad, onError };
}
