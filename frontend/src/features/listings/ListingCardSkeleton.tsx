import { Skeleton } from "../../shared";
import cardStyles from "./ListingCard.module.css";

const CARD_PATTERNS = [
  { kind: "w-12", time: "w-10", t1: "w-11/12", t2: "w-3/5", d2: "w-4/5", tag1: "w-14", tag2: "w-16" },
  { kind: "w-14", time: "w-9", t1: "w-5/6", t2: "w-1/2", d2: "w-3/4", tag1: "w-12", tag2: "w-16" },
  { kind: "w-10", time: "w-8", t1: "w-11/12", t2: "w-2/3", d2: "w-5/6", tag1: "w-16", tag2: "w-20" },
  { kind: "w-14", time: "w-7", t1: "w-4/5", t2: "w-1/2", d2: "w-3/4", tag1: "w-10", tag2: "w-12" },
  { kind: "w-14", time: "w-7", t1: "w-11/12", t2: "w-3/5", d2: "w-4/5", tag1: "w-12", tag2: "w-14" },
];

export function ListingCardSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div
      className={cardStyles.grid}
      role="status"
      aria-label="Loading posts"
    >
      {Array.from({ length: count }, (_, i) => {
        const p = CARD_PATTERNS[i % CARD_PATTERNS.length];
        return (
          <div key={i} className="flex min-w-0 flex-col gap-3">
            <Skeleton media extraClass="aspect-square w-full" />
            <div className="flex items-center justify-between gap-2">
              <Skeleton extraClass={`h-3 ${p.kind}`} />
              <Skeleton extraClass={`h-3 ${p.time}`} />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton extraClass={`h-4 ${p.t1}`} />
              <Skeleton extraClass={`h-4 ${p.t2}`} />
              <Skeleton extraClass="mt-1 h-3.5 w-full" />
              <Skeleton extraClass={`h-3.5 ${p.d2}`} />
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Skeleton extraClass={`h-3.5 ${p.tag1}`} />
                <Skeleton extraClass={`h-3.5 ${p.tag2}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
