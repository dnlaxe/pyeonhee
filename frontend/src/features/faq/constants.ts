import type { Faq, FaqSection } from "./types";

export const faqSections: FaqSection[] = [
  {
    title: "About pyeonhee",
    faqs: [
      {
        question: "What is pyeonhee?",
        answer:
          "pyeonhee is a board for **foreigners living in Korea** — find jobs, buy and sell secondhand items, and browse local posts in one place.",
      },
      {
        question: "Who is this for?",
        answer:
          "Anyone living in Korea who prefers English-friendly listings: teachers, office workers, students, trailing spouses, and anyone still settling in.",
      },
      {
        question: "Is pyeonhee free to use?",
        answer:
          "Browsing jobs and market posts is free. Posting may have simple rules later; for now you can explore everything without an account wall.",
      },
    ],
  },
  {
    title: "Posting & contact",
    faqs: [
      {
        question: "How do I post a job or an item?",
        answer:
          "Use the yellow **post** link in the menu. You'll be able to share a job opening or something you're selling, giving away, or looking for.",
      },
      {
        question: "How does the contact email work?",
        answer:
          "Apply and Contact show a private **@pyeonhee.com** address. Copy it and write from your own inbox — we forward the message to the poster. Replies go through another **@pyeonhee.com** address, so neither of you sees the other's real email. Your mail app's display name and anything in the message body still come through as usual.",
      },
    ],
  },
  {
    title: "Posting rules",
    faqs: [
      {
        question: "What are the posting rules?",
        answer:
          "Keep posts civil and useful. No hate, harassment, discrimination, porn, or graphic content. No scams, phishing, or illegal offers. Be honest about jobs, items, and services — don't mislead people.",
      },
      {
        question: "Can pyeonhee remove my post?",
        answer:
          "Yes. **pyeonhee can edit or delete any post at any time**, for any reason — including posts that break these rules, look shady, or just don't fit the board. If something is removed, we don't owe you a long explanation.",
      },
    ],
  },
  {
    title: "Safety",
    faqs: [
      {
        question: "I found a suspicious listing. What should I do?",
        answer:
          "Don't send money up front or share sensitive documents. Use **report this post** on the listing and skip anything that feels off.",
      },
    ],
  },
];

export const faqs: Faq[] = faqSections.flatMap((s) => s.faqs);
