export function Hero() {
  return (
    <section className="py-12 pb-8">
      <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <div className="bg-yellow px-7 py-10 md:px-14 md:py-[72px] rounded-lg">
          <h1 className="m-0 max-w-[10ch] text-[clamp(40px,6vw,72px)] font-bold leading-[1.12] tracking-[-1.6px] text-text">
            Foreign in Korea.
            <br />
            Not starting from zero.
          </h1>
        </div>
        <p className="m-0 mt-7 max-w-[680px] text-[clamp(22px,2.6vw,32px)] font-normal leading-[1.55] tracking-[-0.6px] text-heading">
          You already live here. This is the board for the job, the bike, and
          the English-speaking dentist. Written by other foreigners, not by a
          company.
        </p>
      </div>
    </section>
  );
}
