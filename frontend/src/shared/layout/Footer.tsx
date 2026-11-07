import { Link } from "react-router";
import { Button } from "../components/Button";
import { footerLinks } from "./config/footer";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-yellow py-8">
        <div className="mx-auto flex w-[min(100%-48px,1120px)] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center max-md:w-[min(100%-32px,1120px)]">
          <div>
            <p className="m-0 text-lg font-semibold text-text-dark">
              Have something to share?
            </p>
            <p className="m-0 mt-1 text-sm text-body">
              Post a job, listing, or event in about a minute.
            </p>
          </div>
          <Button variant="post" to="/post">
            Post something
          </Button>
        </div>
      </div>

      <div className="bg-surface py-6">
        <div className="mx-auto flex w-[min(100%-48px,1120px)] flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between max-md:w-[min(100%-32px,1120px)]">
          <Logo to="/" />
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            {footerLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-mono text-sm text-text-dark no-underline hover:underline hover:underline-offset-[3px]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}