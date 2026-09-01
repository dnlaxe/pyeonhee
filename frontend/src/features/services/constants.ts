export const serviceFilters = [
  "Visa",
  "Translation",
  "Legal",
  "Housing",
  "Banking",
  "Phone & SIM",
  "Moving",
  "Tutoring",
  "Healthcare",
  "Business setup",
] as const;

export type ServiceTag = (typeof serviceFilters)[number];
