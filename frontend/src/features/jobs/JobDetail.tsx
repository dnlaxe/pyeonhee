import { useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Prose,
  ContactForm,
  ReportLink,
  TagList,
  formatTimeSince,
  ErrorMessage,
  LoadingMessage,
  PinIcon,
} from "../../shared";
import { SimilarPosts, findListing, listingsQueryOptions } from "../feed";
import { jobQueryOptions } from "./queries";

function LogoPlaceholder() {
  return (
    <svg viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M1 11C1 16.5 11 16.5 11 11C11 5.5 21 5.5 21 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const [logoReady, setLogoReady] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  const fromList = findListing(
    queryClient.getQueryData(listingsQueryOptions(apiUrl).queryKey),
    "job",
    id,
  );

  const {
    data: job,
    isPending,
    error,
  } = useQuery({
    ...jobQueryOptions(apiUrl, id),
    enabled: Boolean(apiUrl) && Boolean(id) && !fromList,
    initialData: fromList,
  });

  useEffect(() => {
    setLogoReady(false);
    const img = logoRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLogoReady(true);
    }
  }, [id, job?.logo]);

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

  if (!job) {
    return <Navigate to="/?kind=job" replace />;
  }

  const paragraphs = job.description.split("\n").filter(Boolean);
  const logoUrl = job.logo?.trim() || "";

  return (
    <main>
      <article className="py-5 pb-20 md:py-7">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className="mb-5 flex items-start gap-5">
            <div className="detail-logo detail-logo--light shrink-0">
              {!logoReady ? <LogoPlaceholder /> : null}
              {logoUrl ? (
                <img
                  ref={logoRef}
                  src={logoUrl}
                  alt=""
                  hidden={!logoReady}
                  onLoad={() => setLogoReady(true)}
                  onError={() => setLogoReady(false)}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-[clamp(24px,4vw,32px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
                {job.pinned ? (
                  <span className="mr-[0.35em] inline-flex align-middle" aria-label="Pinned">
                    <PinIcon />
                  </span>
                ) : null}
                {job.title}
              </h1>
              <p className="m-0 mt-2 text-sm text-muted">
                {formatTimeSince(job.createdAt)}
              </p>
              <TagList tags={job.tags} className="mt-3" />
            </div>
          </div>
          <Prose paragraphs={paragraphs} />
          <ContactForm
            actionLabel="Apply"
            className="mt-8"
            email={job.email}
            kind="job"
            id={job.id}
          />
          <ReportLink kind="job" id={job.id} />
        </div>
      </article>
      <SimilarPosts kind="job" excludeId={job.id} />
    </main>
  );
}
