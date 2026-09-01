import { useQuery } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  FilterBar,
  useTagFilter,
  ErrorMessage,
} from "../../shared";
import { getMarketItems } from "./marketData";
import { marketFilters } from "./constants";
import { MarketCard } from "./MarketCard";

const PAGE_SIZE = 9;

export function MarketPage() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const {
    data: items = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["market"],
    queryFn: getMarketItems,
  });

  const { visible, hasMore, isEmpty, filter, setFilterTag, loadMore } =
    useTagFilter(
      items,
      (item, tag) => item.tags.includes(tag as (typeof marketFilters)[number]),
      PAGE_SIZE,
    );

  return (
    <main>
      <section className="scroll-mt-20 py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          <h2 className="mb-3 text-2xl font-semibold leading-[1.2] text-text-dark">
            Market
          </h2>

          {!apiUrl && <p className="text-red-700">VITE_API_URL is not set</p>}
          {isPending && <p className="text-muted">Loading…</p>}
          {error && <ErrorMessage error={error} />}

          {!isPending && !error && apiUrl && (
            <>
              <FilterBar
                filters={marketFilters}
                active={filter}
                onChange={setFilterTag}
                spacing="loose"
              />
              {isEmpty ? (
                <EmptyState>No items match this tag.</EmptyState>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-x-[22px] gap-y-7 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                    {visible.map((item) => (
                      <MarketCard key={item.id} item={item} />
                    ))}
                  </div>
                  {hasMore && (
                    <Button variant="more-lg" onClick={loadMore}>
                      see more items
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
