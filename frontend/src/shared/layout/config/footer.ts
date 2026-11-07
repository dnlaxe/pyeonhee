export type FooterLink = {
  to: string;
  label: string;
};

export const footerLinks: FooterLink[] = [
  { to: "/jobs", label: "jobs" },
  { to: "/market", label: "market" },
  { to: "/services", label: "services" },
  { to: "/events", label: "events" },
  { to: "/faq", label: "faq" },
];