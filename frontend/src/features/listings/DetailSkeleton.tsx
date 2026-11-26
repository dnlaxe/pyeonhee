import { Container, Skeleton } from "../../shared";
import type { ListingKind } from "./types";

export function DetailSkeleton({ kind }: { kind: ListingKind }) {
  return (
    <main>
      <article
        className="pt-5 pb-20 md:pt-7"
        role="status"
        aria-label="Loading post"
      >
        <Container narrow>
          {kind === "market" ? (
            <>
              <Skeleton media extraClass="aspect-[16/11] w-full" />
              <div className="mt-6 flex flex-col gap-2.5">
                <Skeleton extraClass="h-7 w-3/4" />
                <Skeleton extraClass="h-3.5 w-16" />
                <Skeleton extraClass="mt-1 h-5 w-28" />
                <div className="mt-1 mb-5 flex flex-wrap gap-1.5">
                  <Skeleton extraClass="h-4 w-14" />
                  <Skeleton extraClass="h-4 w-18" />
                  <Skeleton extraClass="h-4 w-24" />
                </div>
              </div>
            </>
          ) : (
            <div className="mb-5 flex items-start gap-5">
              <Skeleton
                media
                extraClass="aspect-square w-[120px] min-w-[120px] shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-1">
                <Skeleton extraClass="h-7 w-4/5" />
                {kind === "job" ? <Skeleton extraClass="h-7 w-1/2" /> : null}
                <Skeleton extraClass="mt-1 h-3.5 w-16" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Skeleton extraClass="h-4 w-16" />
                  <Skeleton extraClass="h-4 w-24" />
                  <Skeleton extraClass="h-4 w-20" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3">
            <Skeleton extraClass="h-4 w-full" />
            <Skeleton extraClass="h-4 w-11/12" />
            <Skeleton extraClass="h-4 w-4/5" />
            <Skeleton extraClass="mt-3 h-4 w-full" />
            <Skeleton extraClass="h-4 w-full" />
            <Skeleton extraClass="h-4 w-3/4" />
          </div>

          {kind === "service" ? (
            <div className="mt-8 flex flex-col gap-2.5">
              <Skeleton extraClass="h-4 w-48" />
              <Skeleton extraClass="h-4 w-64" />
              <Skeleton extraClass="h-4 w-56" />
            </div>
          ) : (
            <Skeleton media extraClass="mt-8 h-11 w-36" />
          )}
        </Container>
      </article>
    </main>
  );
}
