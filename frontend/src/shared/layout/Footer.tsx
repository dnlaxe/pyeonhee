import { Link } from "react-router";
import { footerLinks } from "../../config";
import { Logo } from "../icons/Logo";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="surface-bg pt-4 pb-6">
      <Container extraClass="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Logo to="/" />
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
          {footerLinks.map((l) => (
            <Link key={l.to} to={l.to} className="link-nav">
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
