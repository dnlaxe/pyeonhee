export const marketFilters = [
  "Furniture",
  "Electronics",
  "Clothing",
  "Kitchen",
  "Books",
  "Sports",
  "Free",
  "Selling",
  "Wanted",
] as const;

export type MarketTag = (typeof marketFilters)[number];

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
