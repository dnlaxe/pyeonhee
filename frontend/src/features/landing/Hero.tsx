export function Hero() {
  return (
    <section className="py-12 pb-8">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <h1 className="mb-5 max-w-[11ch] text-[clamp(36px,5.5vw,64px)] font-bold leading-[1.2] tracking-[-1.5px] text-text">
          Foreign in Korea. Not starting from zero.
        </h1>
        <h2 className="m-0 max-w-[22ch] text-[clamp(18px,2.2vw,24px)] font-normal leading-[1.6] tracking-[-0.5px] text-heading">
          Jobs, secondhand finds, and local posts for people living here.
        </h2>
      </div>
    </section>
  );
}
