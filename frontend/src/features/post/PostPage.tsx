import { Link } from "react-router";
import { BackLink, BagIcon, BriefcaseIcon, FaqLink, UsersIcon } from "../../shared";
import { config, postCopy } from "../../config";

const kindIcons = {
  job: BriefcaseIcon,
  market: BagIcon,
  service: UsersIcon,
} as const;

export function PostPage() {
  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className="mb-4 flex items-center gap-3">
            <BackLink to="/" className="inline-flex shrink-0 text-text">
              back to home
            </BackLink>
            <h1 className="m-0 text-[clamp(24px,4vw,32px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
              Create a post
            </h1>
          </div>
          <p className="mb-8 text-[15px] leading-normal text-body">
            Choose what you want to post. Jobs go to the job board, market posts
            to the marketplace, and services to English Services. See our{" "}
            <FaqLink>FAQs</FaqLink> for posting guidelines and safety tips.
          </p>
          <div className="grid grid-cols-2 gap-3 min-[721px]:grid-cols-3">
            {config.postKinds.map((kind) => {
              const Icon = kindIcons[kind];
              return (
                <Link
                  key={kind}
                  to={`/post/${kind}`}
                  className="@container group relative aspect-square overflow-hidden rounded-none bg-black/50 p-4 text-white transition-colors hover:bg-black/60"
                >
                  <span
                    className="pointer-events-none absolute right-[2%] bottom-[4%] w-[56%] text-white transition-transform duration-300 group-hover:scale-105 [&_svg]:size-full"
                    aria-hidden
                  >
                    <Icon strokeWidth={1.5} />
                  </span>
                  <span className="relative">
                    <span className="text-[14cqi] font-normal leading-[1.1] tracking-normal">
                      {postCopy[kind].label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </article>
    </main>
  );
}
