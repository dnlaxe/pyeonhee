import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Prose,
  TagList,
  formatTimeSince,
  ErrorMessage,
  LogoPlaceholder,
} from "../../shared";
import { throwIfNotOk } from "../../lib/httpError";
import type { Service } from "./types";
import { SimilarPosts } from "../feed";
import logoStyles from "./JobDetail.module.css";

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();

  const {
    data: service,
    isPending,
    error,
  } = useQuery({
    queryKey: ["services", id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/services/${id}`);
      throwIfNotOk(res);
      return (await res.json()) as Promise<Service>;
    },
    enabled: Boolean(apiUrl) && Boolean(id),
    initialData: () =>
      queryClient.getQueryData<Service[]>(["services"])?.find((j) => j.id === id),
    staleTime: Infinity,
  });

  if (!apiUrl) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="text-danger">VITE_API_URL is not set</p>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="mx-auto w-[min(100%-48px,1120px)] max-md:w-[min(100%-32px,1120px)]">
        <p className="text-muted">Loading…</p>
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
      <article className="pt-5 pb-20 md:pt-7">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className="mb-5 flex items-start gap-5">
            <div className={`${logoStyles.detailLogo} shrink-0`}>
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
              <TagList tags={detailTags} extraClass="mt-3" />
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
                className="text-[13px] underline underline-offset-[3px] hover:text-text"
              >
                {service.contact}
              </a>
            </p>
          </div>
          <p className="mt-4 m-0">
            <Link
              to={`/report/service/${service.id}`}
              className="text-[13px] text-muted underline underline-offset-[3px]"
            >
              report this post
            </Link>
          </p>
        </div>
      </article>
      <SimilarPosts kind="service" excludeId={service.id} />
    </main>
  );
}
