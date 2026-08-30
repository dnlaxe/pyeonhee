import { useState } from "react";

export function useTagFilter<T>(
  items: T[],
  hasTag: (item: T, tag: string) => boolean,
  pageSize: number,
) {
  const [filter, setFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filtered = filter
    ? items.filter((item) => hasTag(item, filter))
    : items;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const isEmpty = filtered.length === 0;

  function setFilterTag(tag: string) {
    setFilter((f) => (f === tag ? null : tag));
    setVisibleCount(pageSize);
  }

  function loadMore() {
    setVisibleCount((n) => n + pageSize);
  }

  return {
    filter,
    filtered,
    visible,
    hasMore,
    isEmpty,
    setFilterTag,
    loadMore,
  };
}
