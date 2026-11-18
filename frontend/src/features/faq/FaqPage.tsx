import { faqSections } from "./constants";
import { FaqList } from "./FaqItem";

export function FaqPage() {
  return (
    <main>
      <section className="scroll-mt-20 py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          <h2 className="m-0 text-center text-[clamp(24px,4vw,32px)] leading-[1.2] tracking-[-0.5px] text-text">
            FAQs
          </h2>
          <div className="mx-auto mt-9 flex w-full max-w-[824px] flex-col gap-9">
            <FaqList sections={faqSections} />
          </div>
        </div>
      </section>
    </main>
  );
}
