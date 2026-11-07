import { useState } from "react";
import { richText } from "../../shared";
import type { Faq, FaqSection } from "./types";
import styles from "./FaqItem.module.css";

export function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.item} ${open ? styles.open : ""}`}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className={styles.q}>{faq.question}</span>
      <span className={`${styles.a} ${open ? styles.aOpen : ""}`}>
        {richText(faq.answer)}
      </span>
    </button>
  );
}

export function FaqList({ sections }: { sections: FaqSection[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className={styles.list}>
      {sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h3 className={styles.heading}>{section.title}</h3>
          <div className={styles.grid}>
            {section.faqs.map((faq) => {
              const key = `${section.title}:${faq.question}`;
              return (
                <FaqItem
                  key={key}
                  faq={faq}
                  open={openKey === key}
                  onToggle={() =>
                    setOpenKey((cur) => (cur === key ? null : key))
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
