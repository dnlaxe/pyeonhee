import { useRef } from "react";
import { suggestedSearches } from "../../config";
import { listingKindLabel, type FeedKindFilter } from "../listings/types";
import { parseKindParam } from "./feedFilters";
import styles from "./FeedSearchBar.module.css";

const KIND_OPTIONS = [
  { value: "", label: "All" },
  { value: "job", label: listingKindLabel.job },
  { value: "market", label: listingKindLabel.market },
  { value: "service", label: listingKindLabel.service },
] as const;

type Props = {
  kind: FeedKindFilter;
  query: string;
  onKindChange: (kind: FeedKindFilter) => void;
  onQueryChange: (query: string) => void;
};

export function FeedSearchBar({
  kind,
  query,
  onKindChange,
  onQueryChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <form
          className={styles.searchBar}
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <label htmlFor="latest-kind" className="sr-only">
            Filter by type
          </label>
          <select
            id="latest-kind"
            name="kind"
            className={`select-input ${styles.kindSelect}`}
            value={kind}
            onChange={(e) => onKindChange(parseKindParam(e.target.value))}
          >
            {KIND_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className={styles.divider} aria-hidden />

          <label htmlFor="latest-search" className="sr-only">
            Search posts
          </label>
          <input
            ref={inputRef}
            id="latest-search"
            type="search"
            name="q"
            placeholder="What are you looking for?"
            autoComplete="off"
            className={styles.searchInput}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />

          <button
            type="submit"
            className={styles.searchBtn}
            aria-label="Search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </form>

        <div className={styles.pills} aria-label="Suggested searches">
          {suggestedSearches.map((word) => (
            <button
              key={word}
              type="button"
              className={styles.pill}
              onClick={() => {
                onQueryChange(word);
                inputRef.current?.focus();
              }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
