import { Navigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import {
  Button,
  Container,
  ErrorMessage,
  FaqLink,
  Form,
  FormField,
  PageHeader,
  TextareaInput,
  TextInput,
} from "../../shared";

export function ReportPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;

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
    queryKey: [queryKey, id],
    enabled: Boolean(apiUrl) && Boolean(path),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}${path}`);
      throwIfNotOk(res);
      return (await res.json()) as Promise<{ title?: string; company?: string }>;
    },
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
        <Container>
          <p className="text-meta">Loading…</p>
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
