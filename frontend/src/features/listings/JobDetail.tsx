import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Prose,
  ContactForm,
  TagList,
  formatTimeSince,
  ErrorMessage,
  LoadingState,
  LogoPlaceholder,
  PinIcon,
} from "../../shared";
import { jobDetailQueryOptions } from "./queries";
import { useCallback, useState } from "react";
import styles from "./JobDetail.module.css";
import { SimilarPosts } from "../feed";

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();

  const {
    data: job,
    isPending,
    error,
  } = useQuery(jobDetailQueryOptions(queryClient, id));

  const logoUrl = job?.logo?.trim() || "";
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const logoReady = Boolean(logoUrl) && loadedUrl === logoUrl;

  const logoRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoadedUrl(logoUrl);
      }
    },
    [logoUrl],
  );

  if (!apiUrl) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="m-0 text-[20px] leading-[1.2] text-danger max-[399px]:text-[18px]">
          VITE_API_URL is not set
        </p>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <LoadingState />
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

  return (
    <main>
      <article className="pt-5 pb-20 md:pt-7">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className="mb-5 flex items-start gap-5">
            <div className={`${styles.detailLogo} shrink-0`}>
              {!logoReady ? <LogoPlaceholder /> : null}
              {logoUrl ? (
                <img
                  key={logoUrl}
                  ref={logoRef}
                  src={logoUrl}
                  alt=""
                  hidden={!logoReady}
                  onLoad={() => setLoadedUrl(logoUrl)}
                  onError={() => setLoadedUrl(null)}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-[clamp(24px,4vw,32px)] leading-[1.2] tracking-[-0.5px] text-text">
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
              <TagList tags={job.tags} extraClass="mt-3" />
            </div>
          </div>
          <Prose paragraphs={paragraphs} />
          <ContactForm
            actionLabel="Apply"
            extraClass="mt-8"
            email={job.email}
            kind="job"
            id={job.id}
          />
          <p className="mt-4 m-0">
            <Link
              to={`/report/job/${job.id}`}
              className="text-[13px] text-muted underline underline-offset-[3px]"
            >
              report this post
            </Link>
          </p>
        </div>
      </article>
      <SimilarPosts kind="job" excludeId={job.id} />
    </main>
  );
}