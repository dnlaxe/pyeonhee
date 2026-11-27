import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  ListingLogo,
  Prose,
  TagList,
  formatTimeSince,
  ErrorMessage,
} from "../../shared";
import { serviceDetailQueryOptions } from "./queries";
import { DetailSkeleton } from "./DetailSkeleton";
import { SimilarPosts } from "../feed";

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

  const queryClient = useQueryClient();

  const {
    data: service,
    isPending,
    error,
    refetch,
  } = useQuery(serviceDetailQueryOptions(queryClient, id));

  if (!apiUrl) {
    return (
      <main>
        <Container>
          <p className="text-tone-danger">
            Something went wrong. Please try again later.
          </p>
        </Container>
      </main>
    );
  }

  if (isPending) {
    return <DetailSkeleton kind="service" />;
  }

  if (error) {
    return (
      <main>
        <ErrorMessage
          error={error}
          variant="page"
          onRetry={() => {
            void refetch();
          }}
        />
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
        <Container narrow>
          <div className="mb-5 flex items-start gap-5">
            <ListingLogo src={service.logo} />
            <div className="min-w-0 flex-1">
              <h1 className="heading-page m-0">{service.company}</h1>
              <p className="text-meta m-0 mt-2">
                {formatTimeSince(service.createdAt)}
              </p>
              <TagList tags={detailTags} extraClass="mt-3" />
            </div>
          </div>
          <Prose paragraphs={paragraphs} />
          <div className="text-intro mt-8 flex flex-col gap-2">
            <p className="m-0">
              <span className="text-emphasis">Location:</span> {service.location}
            </p>
            {service.webpage ? (
              <p className="m-0">
                <span className="text-emphasis">Website:</span>{" "}
                <a
                  href={service.webpage}
                  className="link-body"
                  target="_blank"
                  rel="noreferrer"
                >
                  {service.webpage}
                </a>
              </p>
            ) : null}
            <p className="m-0">
              <span className="text-emphasis">Email:</span>{" "}
              <a href={`mailto:${service.contact}`} className="link-body">
                {service.contact}
              </a>
            </p>
          </div>
          <p className="m-0 mt-4">
            <Link to={`/report/service/${service.id}`} className="link-muted">
              Report this post
            </Link>
          </p>
        </Container>
      </article>
      <SimilarPosts kind="service" excludeId={service.id} />
    </main>
  );
}
