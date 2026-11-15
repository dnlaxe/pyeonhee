export type NavLink = {
  path: string;
  label: string;
  highlight?: boolean;
};

export const navLinks: NavLink[] = [
  { path: "/#latest", label: "latest posts" },
  { path: "/post", label: "post", highlight: true },
  { path: "/faq", label: "faq" },
];
