import { faqSections } from "./constants";
import { FaqList } from "./FaqItem";

export function FaqPage() {
  return (
    <main>
      <section className="scroll-mt-20 py-20 max-md:py-14">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
          <h2 className="m-0 text-center text-2xl font-normal leading-[1.6] tracking-[-0.5px] text-heading">
            FAQs
          </h2>
          <div className="mx-auto w-full max-w-[824px]">
            <FaqList sections={faqSections} />
          </div>
        </div>
      </section>
    </main>
  );
}
