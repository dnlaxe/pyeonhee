import { Link } from "react-router";
import { footerLinks } from "../../config";
import { Logo } from "../icons/Logo.tsx";

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-accent py-10 md:py-12">
        <div className="mx-auto flex w-[min(100%-48px,1120px)] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center max-md:w-[min(100%-32px,1120px)]">
          <div className="min-w-0 max-w-xl">
            <p className="m-0 text-[22px] leading-7 text-text md:text-[28px] md:leading-[1.2]">
              Have something to share?
            </p>
            <p className="m-0 mt-2 text-[15px] leading-normal text-body md:text-base md:leading-[1.6]">
              Post a job, listing, or event in about a minute.
            </p>
          </div>
          <Link
            to="/post"
            className="inline-flex shrink-0 items-center justify-center border-[1.5px] border-text bg-bg px-7 py-3.5 text-[20px] leading-[1.2] text-text hover:bg-surface max-[399px]:text-[18px]"
          >
            Post something
          </Link>
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
                className=" text-sm text-text no-underline hover:underline hover:underline-offset-[3px]"
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
