import { Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Prose,
  ReportLink,
  TagList,
  ErrorMessage,
  LoadingMessage,
  formatTimeSince,
} from "../../shared";
import { SimilarPosts, findListing, listingsQueryOptions } from "../feed";
import { serviceQueryOptions } from "./queries";

function LogoPlaceholder() {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M1 11C1 16.5 11 16.5 11 11C11 5.5 21 5.5 21 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const fromList = findListing(
    queryClient.getQueryData(listingsQueryOptions(apiUrl).queryKey),
    "service",
    id,
  );

  const {
    data: service,
    isPending,
    error,
  } = useQuery({
    ...serviceQueryOptions(apiUrl, id),
    enabled: Boolean(apiUrl) && Boolean(id) && !fromList,
    initialData: fromList,
  });

  if (!apiUrl) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="m-0 text-[20px] font-normal leading-[1.2] text-danger max-[399px]:text-[18px]">
          VITE_API_URL is not set
        </p>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <LoadingMessage />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <ErrorMessage error={error} />
      </main>
    );
  }

  if (!service) {
    return <Navigate to="/?kind=service" replace />;
  }

  const paragraphs = service.blurb.split("\n").filter(Boolean);
  const detailTags: string[] = [...service.tags];
  if (service.location && !detailTags.includes(service.location)) {
    detailTags.push(service.location);
  }

  return (
    <main>
      <article className="py-5 pb-20 md:py-7">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className="mb-5 flex items-start gap-5">
            <div className="detail-logo shrink-0">
              {service.logo ? (
                <img src={service.logo} alt="" />
              ) : (
                <LogoPlaceholder />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-[clamp(24px,4vw,32px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
                {service.company}
              </h1>
              <p className="m-0 mt-2 text-sm text-muted">
                {formatTimeSince(service.createdAt)}
              </p>
              <TagList tags={detailTags} className="mt-3" />
            </div>
          </div>
          <Prose paragraphs={paragraphs} />
          <div className="mt-8 flex flex-col gap-2 text-[15px] leading-normal text-body">
            <p className="m-0">
              <span className="text-text">Location:</span> {service.location}
            </p>
            {service.webpage ? (
              <p className="m-0">
                <span className="text-text">Website:</span>{" "}
                <a
                  href={service.webpage}
                  className="underline underline-offset-[3px] hover:text-text"
                  target="_blank"
                  rel="noreferrer"
                >
                  {service.webpage}
                </a>
              </p>
            ) : null}
            <p className="m-0">
              <span className="text-text">Email:</span>{" "}
              <a
                href={`mailto:${service.contact}`}
                className="font-sans text-[13px] underline underline-offset-[3px] hover:text-text"
              >
                {service.contact}
              </a>
            </p>
          </div>
          <ReportLink kind="service" id={service.id} />
        </div>
      </article>
      <SimilarPosts kind="service" excludeId={service.id} />
    </main>
  );
}
