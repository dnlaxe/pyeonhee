import { useEffect, useRef, useState, type ChangeEvent } from "react";

export type PhotoFile = {
  file: File;
  url: string;
};

type PhotoRules = {
  max: number;
  maxBytes: number;
  allowedTypes: readonly string[];
};

export function usePhotoFiles(photoRules: PhotoRules) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const urlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function addPhotos(
    e: ChangeEvent<HTMLInputElement>,
    onError: (message: string) => void,
  ) {
    const chosen = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    let photoError = "";

    for (const file of chosen) {
      if (!photoRules.allowedTypes.includes(file.type)) {
        photoError = "Use a JPEG, PNG, or WebP image.";
        continue;
      }
      if (file.size > photoRules.maxBytes) {
        photoError = "Use a photo smaller than 2 MB.";
        continue;
      }
      valid.push(file);
    }

    const room = Math.max(0, photoRules.max - photos.length);
    const added = valid.slice(0, room).map((file) => {
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);
      return { file, url };
    });

    if (added.length > 0) {
      setPhotos((prev) => [...prev, ...added]);
    }
    onError(photoError);
    e.target.value = "";
  }

  function removePhoto(url: string) {
    URL.revokeObjectURL(url);
    urlsRef.current.delete(url);
    setPhotos((prev) => prev.filter((p) => p.url !== url));
  }

  return { photos, addPhotos, removePhoto };
}
