export type Faq = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  faqs: Faq[];
};
