import { TagList, richParagraphs } from "../../shared";
import type { Service } from "./types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex h-full min-w-0 w-full flex-col gap-4 border border-border bg-white p-6">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={service.logo}
          alt=""
          className="block size-[88px] shrink-0 rounded-full bg-yellow object-cover"
        />
        <div className="min-w-0">
          <div className="text-base font-bold leading-[1.2] text-text-dark [overflow-wrap:anywhere]">
            {service.company}
          </div>
          <div className="mt-0.5 text-[13px] leading-[1.4] text-muted">
            {service.location}
          </div>
          <a
            className="mt-1.5 inline-block max-w-full font-mono text-xs leading-[1.3] text-text-dark underline underline-offset-2 [overflow-wrap:anywhere] hover:text-body"
            href={`mailto:${service.contact}`}
          >
            {service.contact}
          </a>
        </div>
      </div>
      <div className="[&_p]:mb-[0.85em] [&_p]:text-[15px] [&_p]:leading-normal [&_p]:text-body [&_p:last-child]:mb-0 [&_strong]:text-text-dark">
        {richParagraphs(service.blurb)}
      </div>
      <TagList tags={service.tags} className="mb-0 mt-auto" />
    </article>
  );
}
