import { Link } from "react-router";

const linkClass =
  "inline-flex shrink-0 items-center justify-center border-[1.5px] border-text bg-bg px-7 py-3.5 text-[20px] leading-[1.2] text-text hover:bg-surface max-[399px]:text-[18px]";

export function NotFound() {
  return (
    <main>
      <section className="py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay text-center max-md:w-[min(100%-32px,1120px)]">
          <p className="mb-3 text-[clamp(72px,16vw,140px)] leading-none tracking-[-2px] text-text">
            404
          </p>
          <h1 className="mb-8 text-[clamp(24px,4vw,32px)] leading-[1.2] text-text">
            Page not found
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/?kind=job" className={linkClass}>
              work
            </Link>
            <Link to="/?kind=market" className={linkClass}>
              for sale
            </Link>
            <Link to="/?kind=service" className={linkClass}>
              services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
