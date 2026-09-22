import { Button, ErrorMessage } from "../../shared";
import { MarketCard } from "../market/MarketCard";
import type { MarketItem } from "../market/types";

type MarketSectionProps = {
  items: MarketItem[];
  isPending?: boolean;
  error?: Error | null;
  apiUrl?: string;
};

export function MarketSection({
  items,
  isPending,
  error,
  apiUrl,
}: MarketSectionProps) {
  return (
    <section className="scroll-mt-20 py-7">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <h2 className="mb-3 text-2xl font-semibold leading-[1.2] text-text-dark">
          Market
        </h2>

        {!apiUrl && <p className="text-red-700">VITE_API_URL is not set</p>}
        {isPending && <p className="text-muted">Loading…</p>}
        {error && <ErrorMessage error={error} />}

        {!isPending && !error && apiUrl && (
          <div className="relative mt-9 overflow-hidden">
            <div className="grid grid-cols-3 gap-x-[22px] gap-y-7 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              {items.map((item) => (
                <MarketCard key={item.id} item={item} />
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[35%] bg-gradient-to-t from-bg to-transparent"
              aria-hidden
            />
          </div>
        )}

        <Button variant="more" to="/market">
          see more items
        </Button>
      </div>
    </section>
  );
}
