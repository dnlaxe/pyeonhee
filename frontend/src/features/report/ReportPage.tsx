import { useState } from "react";
import { Navigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formRules } from "../../config";
import { throwIfNotOk } from "../../lib/httpError";
import { LIST_STALE_TIME, listingsQueryOptions } from "../listings";
import {
  BotCheck,
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

type ReportErrors = {
  email?: string;
  message?: string;
};

function validateReport(data: FormData): ReportErrors {
  const errors: ReportErrors = {};
  const rules = formRules.report;
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (email === "") {
    errors.email = "Enter an email address.";
  } else if (email.length > rules.email.maxLength) {
    errors.email = "Shorten the email address.";
  } else if (!rules.email.pattern.test(email)) {
    errors.email = "Enter a full email address, like name@example.com.";
  }

  if (message === "") {
    errors.message = "Enter a message.";
  } else if (message.length < rules.message.minLength) {
    errors.message = "Make the message a little longer.";
  } else if (message.length > rules.message.maxLength) {
    errors.message = "Shorten the message.";
  }

  return errors;
}

export function ReportPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<ReportErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const [fields, setFields] = useState<{ email: string; message: string } | null>(
    null,
  );
  const [botCheckError, setBotCheckError] = useState("");

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

  const { data, isPending, error, refetch } = useQuery({
    queryKey: [queryKey, id] as const,
    enabled: Boolean(path),
    staleTime: LIST_STALE_TIME,
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api${path}`, { signal });
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

  const submit = useMutation({
    mutationFn: async (password: string) => {
      if (!fields || !kind || !id) throw new Error("missing fields");
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          id,
          email: fields.email,
          message: fields.message,
          password,
        }),
      });
      if (res.status === 401) return { kind: "botCheckFailed" as const };
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as {
          errors?: ReportErrors;
        } | null;
        if (body?.errors) {
          return { kind: "invalid" as const, errors: body.errors };
        }
      }
      throwIfNotOk(res);
      return { kind: "received" as const };
    },
  });

  if (!path) {
    return <Navigate to="/" replace />;
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
              sent ? undefined : (
                <>
                  Describe what is wrong with this post, such as a scam,
                  harassment, or a misleading listing. Your email is only used
                  so pyeonhee can follow up. Reports are read by hand, and the
                  post may be edited or removed. See our <FaqLink>FAQs</FaqLink>{" "}
                  for safety tips.
                </>
              )
            }
          />

          {sent ? (
            <div className="card-bordered p-5">
              <p className="heading-card m-0 mb-2">Report received</p>
              <p className="text-body-sm m-0">
                Thanks for letting us know. Reports are read by hand, and we
                will follow up at {fields?.email} if we need more details.
              </p>
            </div>
          ) : (
            <>
              <Form
                noValidate
                onSubmit={(e) => {
                  const formData = new FormData(e.currentTarget);
                  const next = validateReport(formData);
                  setSubmitted(true);
                  setErrors(next);
                  if (Object.keys(next).length > 0) return;
                  setFields({
                    email: String(formData.get("email") ?? "").trim(),
                    message: String(formData.get("message") ?? "").trim(),
                  });
                  setBotCheckError("");
                  setReady(true);
                }}
                onChange={(e) => {
                  if (!submitted) return;
                  setErrors(validateReport(new FormData(e.currentTarget)));
                }}
              >
                <fieldset
                  disabled={ready}
                  className="field-fieldset m-0 flex min-w-0 flex-col gap-5 p-0"
                >
                  <FormField label="Email address:" error={errors.email}>
                    <TextInput
                      type="email"
                      name="email"
                      required
                      invalid={Boolean(errors.email)}
                    />
                  </FormField>

                  <FormField label="Message:" error={errors.message}>
                    <TextareaInput
                      name="message"
                      rows={8}
                      required
                      extraClass="field-textarea-lg"
                      invalid={Boolean(errors.message)}
                    />
                  </FormField>
                </fieldset>

                {!ready ? (
                  <Button type="submit" extraClass="mt-2">
                    Send
                  </Button>
                ) : null}
              </Form>

              {ready ? (
                <BotCheck
                  onSubmit={(password) => {
                    setBotCheckError("");
                    submit.mutate(password, {
                      onSuccess: (result) => {
                        if (result.kind === "botCheckFailed") {
                          setBotCheckError("That password is wrong.");
                          return;
                        }
                        if (result.kind === "invalid") {
                          setErrors(result.errors);
                          setReady(false);
                          return;
                        }
                        setSent(true);
                      },
                    });
                  }}
                  pending={submit.isPending}
                  error={botCheckError || submit.error?.message || ""}
                />
              ) : null}
            </>
          )}
        </Container>
      </article>
    </main>
  );
}
