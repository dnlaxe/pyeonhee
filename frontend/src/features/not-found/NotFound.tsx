import { Button } from "../../shared/components/Button";

export function NotFound() {
  return (
    <main>
      <section className="py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay text-center max-md:w-[min(100%-32px,1120px)]">
          <p className="mb-3 font-sans text-[clamp(72px,16vw,140px)] font-bold leading-none tracking-[-2px] text-text-dark">
            404
          </p>
          <h1 className="mb-8 font-mono text-[clamp(24px,4vw,32px)] font-normal leading-[1.2] text-text">
            Page not found
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" to="/jobs">
              jobs
            </Button>
            <Button variant="outline" to="/market">
              market
            </Button>
            <Button variant="outline" to="/services">
              services
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
