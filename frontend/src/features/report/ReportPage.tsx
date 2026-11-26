import { Navigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import { LIST_STALE_TIME, listingsQueryOptions } from "../listings";
import {
  Button,
  Container,
  ErrorMessage,
  FaqLink,
  Form,
  FormField,
  PageHeader,
  Skeleton,
  TextareaInput,
  TextInput,
} from "../../shared";

export function ReportPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();

  const path =
    kind === "job"
      ? `/jobs/${id}`
      : kind === "market"
        ? `/market/${id}`
        : kind === "service"
          ? `/services/${id}`
          : null;
  const queryKey =
    kind === "job" ? "jobs" : kind === "service" ? "services" : "market";
  const backTo =
    kind === "job"
      ? `/jobs/${id}`
      : kind === "service"
        ? `/services/${id}`
        : `/market/${id}`;
  const backLabel =
    kind === "job"
      ? "back to job"
      : kind === "service"
        ? "back to service"
        : "back to market";

  const { data, isPending, error } = useQuery({
    queryKey: [queryKey, id] as const,
    enabled: Boolean(apiUrl) && Boolean(path),
    staleTime: LIST_STALE_TIME,
    queryFn: async ({ signal }) => {
      const res = await fetch(`${apiUrl}${path}`, { signal });
      throwIfNotOk(res);
      return (await res.json()) as { title?: string; company?: string };
    },
    initialData: () => {
      const listings = queryClient.getQueryData(
        listingsQueryOptions().queryKey,
      );
      if (!listings || !id) return undefined;
      if (kind === "job") return listings.jobs.find((j) => j.id === id);
      if (kind === "market") return listings.market.find((m) => m.id === id);
      if (kind === "service") return listings.services.find((s) => s.id === id);
      return undefined;
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(listingsQueryOptions().queryKey)?.dataUpdatedAt,
  });

  if (!path) {
    return <Navigate to="/" replace />;
  }

  if (!apiUrl) {
    return (
      <main>
        <Container>
          <p className="text-tone-danger">VITE_API_URL is not set</p>
        </Container>
      </main>
    );
  }

  if (isPending) {
    return (
      <main>
        <article
          className="py-8 pb-20 md:py-10"
          role="status"
          aria-label="Loading report form"
        >
          <Container narrow>
            <Skeleton extraClass="mb-4 h-8 w-2/3" />
            <div className="mb-8 flex flex-col gap-2">
              <Skeleton extraClass="h-4 w-full" />
              <Skeleton extraClass="h-4 w-5/6" />
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Skeleton extraClass="h-3.5 w-28" />
                <Skeleton media extraClass="h-11 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton extraClass="h-3.5 w-20" />
                <Skeleton media extraClass="h-40 w-full" />
              </div>
              <Skeleton media extraClass="mt-2 h-11 w-36" />
            </div>
          </Container>
        </article>
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

  if (!data) {
    return <Navigate to={backTo} replace />;
  }

  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <Container narrow>
          <PageHeader
            backTo={backTo}
            backLabel={backLabel}
            title={`Reporting ${data.title ?? data.company}`}
            intro={
              <>
                Describe what is wrong with this post, such as a scam,
                harassment, or a misleading listing. Your email is only used so
                pyeonhee can follow up. Reports are read by hand, and the post
                may be edited or removed. See our <FaqLink>FAQs</FaqLink> for
                safety tips.
              </>
            }
          />

          <Form>
            <FormField label="Email address:">
              <TextInput type="email" name="email" required />
            </FormField>

            <FormField label="Message:">
              <TextareaInput
                name="message"
                rows={8}
                required
                extraClass="field-textarea-lg"
              />
            </FormField>

            <Button type="submit" extraClass="mt-2">
              Send
            </Button>
          </Form>
        </Container>
      </article>
    </main>
  );
}
