export type MarketItem = {
  id: string;
  title: string;
  location: string;
  price: string;
  description: string;
  images: string[];
  tags: string[];
  email?: string;
  pinned: boolean;
  createdAt: string;
};
