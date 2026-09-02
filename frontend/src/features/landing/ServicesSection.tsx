import { Button } from "../../shared";
import { ServiceCard } from "../services/ServiceCard";
import type { Service } from "../services/types";

type ServicesSectionProps = {
  services: Service[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="scroll-mt-20 py-7 pb-20">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <h2 className="mb-3 text-2xl font-semibold leading-[1.2] text-text-dark">
          English Services
        </h2>
        <div className="relative mt-9 overflow-hidden">
          <div className="grid grid-cols-3 items-stretch gap-5 max-[1040px]:grid-cols-2 max-[720px]:grid-cols-1">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[35%] bg-gradient-to-t from-bg to-transparent"
            aria-hidden
          />
        </div>
        <Button variant="more" to="/services">
          see more services
        </Button>
      </div>
    </section>
  );
}
