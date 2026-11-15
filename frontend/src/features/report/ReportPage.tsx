import { Navigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/httpError";
import {
  BackLink,
  Button,
  ErrorMessage,
  LoadingMessage,
  FaqLink,
  Form,
  FormField,
  TextareaInput,
  TextInput,
} from "../../shared";

function reportTarget(kind: string | undefined, id: string | undefined) {
  if (!kind || !id) return null;
  if (kind === "job") {
    return {
      path: `/jobs/${id}`,
      backTo: `/jobs/${id}`,
      backLabel: "back to job",
    };
  }
  if (kind === "market") {
    return {
      path: `/market/${id}`,
      backTo: `/market/${id}`,
      backLabel: "back to listing",
    };
  }
  if (kind === "service") {
    return {
      path: `/services/${id}`,
      backTo: `/services/${id}`,
      backLabel: "back to service",
    };
  }
  return null;
}

export function ReportPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const apiUrl = import.meta.env.VITE_API_URL;
  const target = reportTarget(kind, id);

  // Own key — never write into ["jobs"|"market"|"services", id] (detail pages).
  const { data, isPending, error } = useQuery({
    queryKey: ["report", kind, id] as const,
    enabled: Boolean(apiUrl) && Boolean(target),
    queryFn: async () => {
      const res = await fetch(`${apiUrl}${target!.path}`);
      throwIfNotOk(res);
      const body = (await res.json()) as {
        title?: string;
        company?: string;
      };
      return {
        title: body.title ?? body.company ?? "this post",
      };
    },
  });

  if (!target) {
    return <Navigate to="/" replace />;
  }

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

  if (!data) {
    return <Navigate to={target.backTo} replace />;
  }

  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <div className="mx-auto w-[min(100%-48px,1120px)] max-w-essay max-md:w-[min(100%-32px,1120px)]">
          <BackLink to={target.backTo}>{target.backLabel}</BackLink>
          <h1 className="mb-4 text-[clamp(24px,4vw,32px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
            Reporting {data.title}
          </h1>
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
              <TextareaInput name="message" rows={8} required className="min-h-[160px]" />
            </FormField>

            <Button type="submit" variant="accent" className="mt-2">
              Send
            </Button>
          </Form>
        </div>
      </article>
    </main>
  );
}
