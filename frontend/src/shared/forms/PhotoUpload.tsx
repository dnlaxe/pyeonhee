import type { ChangeEvent } from "react";
import type { PhotoFile } from "./usePhotoFiles";

type Props = {
  label: string;
  error?: string;
  photos: PhotoFile[];
  max: number;
  accept: string;
  multiple?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (url: string) => void;
};

export function PhotoUpload({
  label,
  error,
  photos,
  max,
  accept,
  multiple = false,
  onChange,
  onRemove,
}: Props) {
  const atLimit = photos.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <span className="field-label">{label}</span>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`btn-upload inline-flex items-center justify-center${
              atLimit ? " btn-upload-disabled" : ""
            }`}
          >
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={atLimit}
              onChange={onChange}
              className="sr-only"
            />
            {multiple ? "Add photos" : "Add photo"}
          </label>
          <span className="text-meta">
            {photos.length}/{max}
          </span>
        </div>

        {photos.length > 0 && (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {photos.map((photo) => (
              <li key={photo.url} className="relative">
                <img src={photo.url} alt="" className="photo-thumb block" />
                <button
                  type="button"
                  onClick={() => onRemove(photo.url)}
                  aria-label="Remove photo"
                  className="photo-remove absolute -top-1.5 -right-1.5 flex items-center justify-center"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
