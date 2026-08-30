export type Job = {
  id: string;
  title: string;
  location: string;
  description: string;
  tags: string[];
  initials: string;
  level: number;
  status: string;
  createdAt: string;
};

export const jobFilters = [
  "Full Time",
  "Part Time",
  "Remote",
  "Hospitality",
  "English Teaching",
  "No Korean Required",
  "Korean Helpful",
  "Tech",
  "Fitness",
  "Math",
  "Doesn't exist",
] as const;
