export type NavLink = {
  path: string;
  label: string;
  highlight?: boolean;
};

export const navLinks: NavLink[] = [
  { path: "/jobs", label: "jobs" },
  { path: "/market", label: "market" },
  { path: "/services", label: "services" },
  { path: "/events", label: "events" },
  { path: "/post", label: "post", highlight: true },
  { path: "/faq", label: "faq" },
];
