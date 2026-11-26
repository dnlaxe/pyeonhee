import { Link, Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  ListingLogo,
  Prose,
  ContactForm,
  TagList,
  formatTimeSince,
  ErrorMessage,
  LoadingState,
  PinIcon,
} from "../../shared";
import { jobDetailQueryOptions } from "./queries";
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

  if (!apiUrl) {
    return (
      <main>
        <Container>
          <p className="heading-section text-tone-danger m-0">
            VITE_API_URL is not set
          </p>
        </Container>
      </main>
    );
  }

  if (isPending) {
    return (
      <main>
        <Container>
          <LoadingState />
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Container>
          <ErrorMessage error={error} />
        </Container>
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
        <Container narrow>
          <div className="mb-5 flex items-start gap-5">
            <ListingLogo src={job.logo} />
            <div className="min-w-0 flex-1">
              <h1 className="heading-page m-0">
                {job.pinned ? (
                  <span className="pin-detail" aria-label="Pinned">
                    <PinIcon />
                  </span>
                ) : null}
                {job.title}
              </h1>
              <p className="text-meta m-0 mt-2">
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
          <p className="m-0 mt-4">
            <Link to={`/report/job/${job.id}`} className="link-muted">
              Report this post
            </Link>
          </p>
        </Container>
      </article>
      <SimilarPosts kind="job" excludeId={job.id} />
    </main>
  );
}
