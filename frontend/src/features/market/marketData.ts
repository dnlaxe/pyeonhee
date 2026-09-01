import items from "./data.json";
import type { MarketItem } from "./types";

const marketItems = items as MarketItem[];

export function getMarketItems(): Promise<MarketItem[]> {
  return Promise.resolve(marketItems);
}

export function getMarketItemById(id: string): Promise<MarketItem | undefined> {
  return Promise.resolve(marketItems.find((item) => item.id === id));
}
