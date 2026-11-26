import { Link } from "react-router";
import { footerLinks } from "../../config";
import { Logo } from "../icons/Logo";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="surface-bg pt-4 pb-6">
      <Container extraClass="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Logo to="/" />
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-2"
            aria-label="Footer"
          >
            {footerLinks.map((l) => (
              <Link key={l.to} to={l.to} className="link-nav">
                {l.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}
