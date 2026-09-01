import type { MarketTag } from "./constants";

export type MarketItem = {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: MarketTag[];
};
