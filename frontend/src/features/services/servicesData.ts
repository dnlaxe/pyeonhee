import items from "./data.json";
import type { Service } from "./types";

const services = items as Service[];

export function getServices(): Promise<Service[]> {
  return Promise.resolve(services);
}
