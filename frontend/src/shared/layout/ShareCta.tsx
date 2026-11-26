import { Button } from "../ui/Button";
import { Container } from "./Container";

export function ShareCta() {
  return (
    <div className="surface-bg mt-auto">
      <Container extraClass="pt-6 pb-0">
        <div className="cta-banner flex flex-col items-start justify-between gap-6 px-6 py-8 sm:flex-row sm:items-center md:px-10 md:py-10">
          <div className="min-w-0 max-w-xl">
            <p className="heading-cta m-0">Have something to share?</p>
            <p className="text-intro text-cta-sub m-0 mt-2">
              Post a job, listing, or event in about a minute.
            </p>
          </div>
          <Button variant="secondary" to="/post" extraClass="shrink-0">
            Post something
          </Button>
        </div>
      </Container>
    </div>
  );
}
