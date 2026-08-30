export type FooterLink = {
  to: string;
  label: string;
};

export const footerLinks: FooterLink[] = [
  { to: "/jobs", label: "jobs" },
  { to: "/market", label: "market" },
  { to: "/events", label: "events" },
  { to: "/post", label: "post" },
  { to: "/faq", label: "faq" },
];

export const footerTagline =
  "Jobs, market, and posts for foreigners living in Korea.";
