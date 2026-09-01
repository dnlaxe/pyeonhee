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
