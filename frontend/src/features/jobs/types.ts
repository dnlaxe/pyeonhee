export type Job = {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  logo?: string;
  pinned: boolean;
  status: string;
  createdAt: string;
};
