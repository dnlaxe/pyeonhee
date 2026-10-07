import { Button, BackLink, FaqLink } from "../../shared";
import {kinds} from "./constants.ts";

export function PostPage() {
  return (
    <main>
      <article className="py-2 pb-20">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <BackLink to="/">back to home</BackLink>
          <h1 className="mb-4 text-[clamp(24px,4vw,32px)] font-bold leading-[1.2] tracking-[-0.5px] text-text">
            Create a post
          </h1>
          <p className="mb-8 text-[15px] leading-normal text-body">
            Choose what you want to post. Jobs go to the job board, market posts
            to the marketplace, and services to English Services. See our{" "}
            <FaqLink>FAQs</FaqLink> for posting guidelines and safety tips.
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(kinds).map(([key, kind]) => (
              <Button key={key} variant="yellow-lg" to={`/post/${key}`}>
                {kind.label}
              </Button>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
