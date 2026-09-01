import { useQuery } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  FilterBar,
  useTagFilter,
  ErrorMessage,
} from "../../shared";
import { serviceFilters } from "./constants";
import { getServices } from "./servicesData";
import { ServiceCard } from "./ServiceCard";

const PAGE_SIZE = 9;

export function ServicesPage() {
  const {
    data: services = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const { visible, hasMore, isEmpty, filter, setFilterTag, loadMore } =
    useTagFilter(
      services,
      (s, tag) => s.tags.includes(tag as (typeof serviceFilters)[number]),
      PAGE_SIZE,
    );

  return (
    <main>
      <section className="scroll-mt-20 py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          <h2 className="mb-3 text-2xl font-semibold leading-[1.2] text-text-dark">
            English Services
          </h2>

          {isPending && <p className="text-muted">Loading…</p>}
          {error && <ErrorMessage error={error} />}

          {!isPending && !error && (
            <>
              <FilterBar
                filters={serviceFilters}
                active={filter}
                onChange={setFilterTag}
                spacing="loose"
              />
              {isEmpty ? (
                <EmptyState>No services match this tag.</EmptyState>
              ) : (
                <>
                  <div className="grid grid-cols-3 items-stretch gap-5 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1">
                    {visible.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                  {hasMore && (
                    <Button variant="more-lg" onClick={loadMore}>
                      see more services
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
