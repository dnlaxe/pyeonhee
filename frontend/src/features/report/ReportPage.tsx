import { Navigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import {
  BackLink,
  ErrorMessage,
  FaqLink,
  Form,
  FormField,
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
      return await res.json() as Promise<{ title?: string; company?: string }>;
    },
  });

  if (!path) {
    return <Navigate to="/" replace />;
  }

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

  if (!data) {
    return <Navigate to={backTo} replace />;
  }

  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <div className="mb-4 flex items-center gap-3">
            <BackLink to={backTo} extraClass="inline-flex shrink-0 text-text">
              {backLabel}
            </BackLink>
            <h1 className="m-0 text-[clamp(24px,4vw,32px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
              Reporting {data.title ?? data.company}
            </h1>
          </div>
          <p className="mb-8 text-[15px] leading-normal text-body">
            Describe what is wrong with this post, such as a scam, harassment,
            or a misleading listing. Your email is only used so pyeonhee can
            follow up. Reports are read by hand, and the post may be edited or
            removed. See our <FaqLink>FAQs</FaqLink> for safety tips.
          </p>

          <Form>
            <FormField label="Email address:">
              <TextInput type="email" name="email" required />
            </FormField>

            <FormField label="Message:">
              <TextareaInput name="message" rows={8} required extraClass="min-h-[160px]" />
            </FormField>

            <button type="submit" className="primaryBtn mt-2">
              Send
            </button>
          </Form>
        </div>
      </article>
    </main>
  );
}
