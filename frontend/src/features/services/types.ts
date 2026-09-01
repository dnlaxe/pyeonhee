import type { ServiceTag } from "./constants";

export type Service = {
  id: string;
  company: string;
  location: string;
  logo: string;
  blurb: string;
  contact: string;
  tags: ServiceTag[];
};
