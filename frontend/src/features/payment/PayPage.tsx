import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Container, ErrorMessage } from "../../shared";
import { AppError, throwIfNotOk } from "../../lib/httpError";
import { listingsQueryOptions } from "../listings";
import { PaymentStep } from "./PaymentStep";
import type { Order } from "./types";

const API = import.meta.env.VITE_API_URL;

type PayKind = "job" | "market" | "service";

function unexpectedKind(kind: never): never {
  throw new Error(`unexpected pay kind: ${String(kind)}`);
}

type PayDraft = {
  kind: PayKind;
  title: string;
  id: string;
  cancelTo: string;
};

const draftSources = [
  { key: "serviceDraft", kind: "service", titleField: "company", cancelTo: "/post/service" },
  { key: "marketDraft", kind: "market", titleField: "title", cancelTo: "/post/market" },
  { key: "jobDraft", kind: "job", titleField: "title", cancelTo: "/post/job" },
] as const;

function readDraft(): PayDraft | null {
  const target = sessionStorage.getItem("payTarget");
  const source = draftSources.find((source) => source.kind === target);
  if (!source) return null;

  const raw = sessionStorage.getItem(source.key);
  if (!raw) return null;

  let stashedFormData: Record<string, string | undefined>;
  try {
    stashedFormData = JSON.parse(raw) as Record<string, string | undefined>;
  } catch {
    return null;
  }

  const id = stashedFormData.id;
  const title = stashedFormData[source.titleField];
  if (!id) return null;

  return {
    kind: source.kind,
    title: title ?? "",
    id,
    cancelTo: source.cancelTo,
  };
}

function payUrl(path: string, kind: PayKind, id: string) {
  const q = new URLSearchParams({ kind, id });
  return `${window.location.origin}${path}?${q}`;
}

async function checkout(draft: PayDraft): Promise<Order> {
  const res = await fetch(`${API}/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: draft.kind, id: draft.id }),
  });
  throwIfNotOk(res);
  return (await res.json()) as Order;
}

type ConfirmVars = {
  kind: PayKind;
  id: string;
  orderId: string;
  paymentKey: string;
  amount: number;
};

function draftKeyFor(kind: PayKind): string {
  switch (kind) {
    case "job":
      return "jobDraft";
    case "market":
      return "marketDraft";
    case "service":
      return "serviceDraft";
    default:
      return unexpectedKind(kind);
  }
}

async function confirmPayment(body: ConfirmVars): Promise<PayKind> {
  const res = await fetch(`${API}/payments/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 402) {
    throw new AppError(
      "Your payment was declined. Please try again.",
      "warning",
    );
  }
  throwIfNotOk(res);
  return body.kind;
}

function PayLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main>
      <article className="py-8 pb-20 md:py-10">
        <Container narrow extraClass="flex flex-col gap-4">
          <h1 className="heading-page m-0">{title}</h1>
          {children}
        </Container>
      </article>
    </main>
  );
}

export function PayPage() {
  const [draft] = useState(readDraft);
  const start = useMutation({ mutationFn: checkout });

  if (!draft) {
    return (
      <PayLayout title="Payment">
        <p className="text-intro m-0">
          Start from the job, market, or service form.
        </p>
      </PayLayout>
    );
  }

  if (start.data) {
    return (
      <PayLayout title="Payment">
        <PaymentStep
          order={start.data}
          successUrl={payUrl("/pay/success", draft.kind, draft.id)}
          failUrl={payUrl("/pay/fail", draft.kind, draft.id)}
        />
      </PayLayout>
    );
  }

  return (
    <PayLayout title="Payment">
      <p className="text-intro m-0">Pay for {draft.title}.</p>
      {start.error && <ErrorMessage error={start.error} />}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={start.isPending}
          onClick={() => start.mutate(draft)}
        >
          {start.isPending ? "Starting…" : "Continue to payment"}
        </Button>
        <Button to={draft.cancelTo} variant="secondary">
          Cancel
        </Button>
      </div>
    </PayLayout>
  );
}

export function PaySuccessPage() {
  const [params] = useSearchParams();
  const kindParam = params.get("kind");
  const id = params.get("id") ?? "";
  const orderId = params.get("orderId") ?? "";
  const paymentKey = params.get("paymentKey") ?? "";
  const amount = Number(params.get("amount"));

  const kind: PayKind | null =
    kindParam === "job" || kindParam === "market" || kindParam === "service"
      ? kindParam
      : null;
  const complete = Boolean(kind && id && orderId && paymentKey && amount);
  const queryClient = useQueryClient();
  const confirm = useMutation({
    mutationFn: confirmPayment,
    onSuccess: (confirmedKind) => {
      sessionStorage.removeItem(draftKeyFor(confirmedKind));
      if (sessionStorage.getItem("payTarget") === confirmedKind) {
        sessionStorage.removeItem("payTarget");
      }
      return queryClient.invalidateQueries({
        queryKey: listingsQueryOptions().queryKey,
      });
    },
  });

  const confirmKey = complete
    ? `${kind}:${id}:${orderId}:${paymentKey}:${amount}`
    : null;
  const triggeredKeyRef = useRef<string | null>(null);
  const { mutate } = confirm;

  useEffect(() => {
    if (!confirmKey || !kind || triggeredKeyRef.current === confirmKey) return;
    triggeredKeyRef.current = confirmKey;
    mutate({ kind, id, orderId, paymentKey, amount });
  }, [confirmKey, kind, id, orderId, paymentKey, amount, mutate]);

  if (!kind || !id || !orderId || !paymentKey || !amount) {
    return (
      <PayLayout title="Payment">
        <p className="text-intro m-0">Missing payment details.</p>
      </PayLayout>
    );
  }

  if (confirm.isIdle || confirm.isPending) {
    return (
      <PayLayout title="Payment">
        <p className="text-intro m-0">Confirming payment…</p>
      </PayLayout>
    );
  }

  if (confirm.error) {
    return (
      <PayLayout title="Payment not completed">
        <ErrorMessage error={confirm.error} />
        <div>
          <Button to="/pay">Try again</Button>
        </div>
      </PayLayout>
    );
  }

  let viewTo: string;
  let liveLabel: string;
  switch (kind) {
    case "job":
      viewTo = `/jobs/${id}`;
      liveLabel = "job";
      break;
    case "market":
      viewTo = `/market/${id}`;
      liveLabel = "item";
      break;
    case "service":
      viewTo = `/services/${id}`;
      liveLabel = "service";
      break;
    default:
      return unexpectedKind(kind);
  }
  return (
    <PayLayout title="Thank you">
      <p className="text-intro m-0">
        Payment received. Your {liveLabel} is now live.
      </p>
      <div>
        <Button to={viewTo}>View your {liveLabel}</Button>
      </div>
    </PayLayout>
  );
}

export function PayFailPage() {
  const [params] = useSearchParams();
  const cancelled = params.get("code") === "PAY_PROCESS_CANCELED";

  return (
    <PayLayout title="Payment not completed">
      <p className="text-intro m-0">
        {cancelled
          ? "You cancelled the payment."
          : "The payment did not go through."}
      </p>
      <div>
        <Button to="/pay">Try again</Button>
      </div>
    </PayLayout>
  );
}