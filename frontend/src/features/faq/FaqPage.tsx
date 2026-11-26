import { Container } from "../../shared";
import { faqSections } from "./constants";
import { FaqList } from "./FaqItem";

export function FaqPage() {
  return (
    <main>
      <section className="scroll-mt-20 py-20 max-md:py-14">
        <Container>
          <h1 className="heading-page m-0 text-center">FAQs</h1>
          <div className="mx-auto mt-9 flex w-full max-w-[824px] flex-col gap-9">
            <FaqList sections={faqSections} />
          </div>
        </Container>
      </section>
    </main>
  );
}
